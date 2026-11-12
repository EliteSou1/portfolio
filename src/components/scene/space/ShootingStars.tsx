'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS, SPACE_DYNAMICS } from '@/lib/spaceConfig';

const meteorVertexShader = `
  uniform float uTime;
  attribute vec3 aStart;
  attribute vec3 aDir;
  attribute float aBirth;
  attribute float aSpeed;
  attribute float aLife;
  attribute vec3 aColor;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vProgress;

  void main() {
    vUv = uv;
    vColor = aColor;

    float age = uTime - aBirth;
    float progress = age / aLife;
    vProgress = progress;

    // Discard / collapse instances that are inactive or expired
    if (age < 0.0 || progress > 1.0) {
      gl_Position = vec4(0.0, 0.0, -9999.0, 1.0);
      return;
    }

    // 1. Calculate active head position along trajectory
    vec3 headPos = aStart + aDir * (aSpeed * age);

    // 2. Trail length dynamically stretches up to max streak length
    float maxTrail = aSpeed * 0.32;
    float trailLen = min(age * aSpeed, maxTrail);

    // 3. Camera-facing billboard side vector perpendicular to trajectory
    vec3 toCam = cameraPosition - headPos;
    vec3 sideDir = normalize(cross(aDir, toCam));
    float width = 0.32 * (1.0 - progress * 0.4);

    // 4. Construct oriented quad: uv.x = 0 (tail), uv.x = 1 (head)
    vec3 worldPos = headPos - aDir * (trailLen * (1.0 - uv.x)) + sideDir * ((uv.y - 0.5) * width);

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const meteorFragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vProgress;

  void main() {
    if (vProgress < 0.0 || vProgress > 1.0) discard;

    // Longitudinal fade: subtle, crisp streak
    float headGlow = pow(vUv.x, 2.5);
    // Transverse cross-section: fine hairline core, soft edges
    float crossEdge = 1.0 - abs(vUv.y - 0.5) * 2.0;
    float alpha = headGlow * pow(max(0.0, crossEdge), 2.0) * (1.0 - pow(vProgress, 2.0)) * 0.45;

    if (alpha < 0.005) discard;

    // Subtle natural starlight white-cyan tip
    vec3 finalColor = mix(vColor, vec3(0.95, 0.98, 1.0), pow(vUv.x, 4.0));
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface ShootingStarsProps {
  isMobile?: boolean;
}

export function ShootingStars({ isMobile = false }: ShootingStarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  const poolSize = isMobile
    ? SPACE_BUDGETS.mobile.shootingStarPool
    : SPACE_BUDGETS.desktop.shootingStarPool;

  const nextSpawnTime = useRef(THREE.MathUtils.randFloat(12.0, 24.0));
  const activeIndex = useRef(0);

  // Persistent vectors for trajectory allocation
  const camDir = useRef(new THREE.Vector3());
  const camRight = useRef(new THREE.Vector3());
  const camUp = useRef(new THREE.Vector3());
  const spawnCenter = useRef(new THREE.Vector3());
  const startPos = useRef(new THREE.Vector3());
  const travelDir = useRef(new THREE.Vector3());

  // Instanced Attributes
  const [geometry, material, attrRefs] = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.index = plane.index;
    instGeo.attributes.position = plane.attributes.position;
    instGeo.attributes.uv = plane.attributes.uv;

    const starts = new Float32Array(poolSize * 3);
    const dirs = new Float32Array(poolSize * 3);
    const births = new Float32Array(poolSize);
    const speeds = new Float32Array(poolSize);
    const lives = new Float32Array(poolSize);
    const colors = new Float32Array(poolSize * 3);

    // Initialize all to dormant state
    for (let i = 0; i < poolSize; i++) {
      births[i] = -999.0;
      lives[i] = SPACE_DYNAMICS.shootingStarDuration;
      speeds[i] = SPACE_DYNAMICS.shootingStarSpeed;

      // Default brilliant blue-white
      colors[i * 3] = 0.85;
      colors[i * 3 + 1] = 0.94;
      colors[i * 3 + 2] = 1.0;
    }

    const aStart = new THREE.InstancedBufferAttribute(starts, 3);
    const aDir = new THREE.InstancedBufferAttribute(dirs, 3);
    const aBirth = new THREE.InstancedBufferAttribute(births, 1);
    const aSpeed = new THREE.InstancedBufferAttribute(speeds, 1);
    const aLife = new THREE.InstancedBufferAttribute(lives, 1);
    const aColor = new THREE.InstancedBufferAttribute(colors, 3);

    instGeo.setAttribute('aStart', aStart);
    instGeo.setAttribute('aDir', aDir);
    instGeo.setAttribute('aBirth', aBirth);
    instGeo.setAttribute('aSpeed', aSpeed);
    instGeo.setAttribute('aLife', aLife);
    instGeo.setAttribute('aColor', aColor);

    const mat = new THREE.ShaderMaterial({
      vertexShader: meteorVertexShader,
      fragmentShader: meteorFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    return [
      instGeo,
      mat,
      { aStart, aDir, aBirth, aSpeed, aLife, aColor },
    ];
  }, [poolSize]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    // Check if it's time to spawn the next meteor in pool (every 3–9s)
    if (t >= nextSpawnTime.current) {
      const idx = activeIndex.current;
      activeIndex.current = (activeIndex.current + 1) % poolSize;

      // Calculate camera orientation vectors
      camera.getWorldDirection(camDir.current);
      camRight.current.crossVectors(camDir.current, camera.up).normalize();
      camUp.current.crossVectors(camRight.current, camDir.current).normalize();

      // Spawn ~70 units ahead of camera across visible field
      const dist = SPACE_DYNAMICS.shootingStarDistance;
      spawnCenter.current.copy(camera.position).addScaledVector(camDir.current, dist);

      // Random offset in viewport plane
      const offsetX = THREE.MathUtils.randFloatSpread(55);
      const offsetY = THREE.MathUtils.randFloat(5, 35);
      startPos.current
        .copy(spawnCenter.current)
        .addScaledVector(camRight.current, offsetX)
        .addScaledVector(camUp.current, offsetY);

      // Angled trajectory crossing down and across
      const travelX = THREE.MathUtils.randFloat(-1.0, 1.0);
      const travelY = THREE.MathUtils.randFloat(-0.8, -0.3);
      const travelZ = THREE.MathUtils.randFloat(-0.4, 0.4);
      travelDir.current
        .copy(camRight.current)
        .multiplyScalar(travelX)
        .addScaledVector(camUp.current, travelY)
        .addScaledVector(camDir.current, travelZ)
        .normalize();

      // Write instance attributes
      const sArr = attrRefs.aStart.array as Float32Array;
      const dArr = attrRefs.aDir.array as Float32Array;
      const bArr = attrRefs.aBirth.array as Float32Array;
      const spArr = attrRefs.aSpeed.array as Float32Array;
      const cArr = attrRefs.aColor.array as Float32Array;

      sArr[idx * 3] = startPos.current.x;
      sArr[idx * 3 + 1] = startPos.current.y;
      sArr[idx * 3 + 2] = startPos.current.z;

      dArr[idx * 3] = travelDir.current.x;
      dArr[idx * 3 + 1] = travelDir.current.y;
      dArr[idx * 3 + 2] = travelDir.current.z;

      bArr[idx] = t;
      spArr[idx] = THREE.MathUtils.randFloat(42.0, 56.0);

      // 75% Cyan-White, 25% Radiant Golden Meteor
      const isGold = Math.random() < 0.25;
      if (isGold) {
        cArr[idx * 3] = 1.0;
        cArr[idx * 3 + 1] = 0.82;
        cArr[idx * 3 + 2] = 0.42;
      } else {
        cArr[idx * 3] = 0.82;
        cArr[idx * 3 + 1] = 0.94;
        cArr[idx * 3 + 2] = 1.0;
      }

      // Mark attributes for single upload
      attrRefs.aStart.needsUpdate = true;
      attrRefs.aDir.needsUpdate = true;
      attrRefs.aBirth.needsUpdate = true;
      attrRefs.aSpeed.needsUpdate = true;
      attrRefs.aColor.needsUpdate = true;

      // Schedule next meteor spawn interval (3 to 9 seconds)
      nextSpawnTime.current =
        t +
        THREE.MathUtils.randFloat(
          SPACE_DYNAMICS.shootingStarIntervalMin,
          SPACE_DYNAMICS.shootingStarIntervalMax
        );
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry as unknown as THREE.BufferGeometry, material, poolSize]}
      frustumCulled={false}
    />
  );
}
