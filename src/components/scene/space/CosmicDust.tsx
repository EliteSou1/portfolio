'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS, SPACE_DYNAMICS } from '@/lib/spaceConfig';
import { spaceStore } from './spaceStore';
import { getParticleCircleTexture } from '@/lib/particle-texture';

const cosmicDustVertexShader = `
  uniform vec3 uCameraPos;
  uniform vec3 uCamVelocity;
  uniform vec3 uMouseWorld;
  uniform float uMouseActive;
  uniform float uTime;
  uniform float uBoxSize;

  attribute vec3 aVelocity;
  attribute float aSize;
  attribute float aBaseAlpha;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // 1. Base autonomous cosmic drift
    vec3 p = position + aVelocity * (uTime * 0.2);

    // 2. Vertex Modular Wrap: Particles dynamically wrap around camera in real-time
    // Without ANY CPU repositioning cost per frame
    vec3 rel = p - uCameraPos;
    rel = mod(rel + vec2(uBoxSize * 0.5).xxy, uBoxSize) - vec2(uBoxSize * 0.5).xxy;
    vec3 worldPos = uCameraPos + rel;

    // 3. Interactive Mouse Repulsion in World Space
    if (uMouseActive > 0.5) {
      vec3 toMouse = worldPos - uMouseWorld;
      float dist = length(toMouse);
      float repulseRadius = 6.0;
      if (dist < repulseRadius && dist > 0.05) {
        float force = pow(1.0 - dist / repulseRadius, 2.0) * 1.8;
        worldPos += normalize(toMouse) * force;
      }
    }

    // 4. Subtle elongation / speed trail in camera travel direction
    float speed = length(uCamVelocity);
    if (speed > 0.1) {
      worldPos -= normalize(uCamVelocity) * min(speed * 0.15, 1.2);
    }

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Soft point size with distance attenuation and speed stretch
    float distToCam = length(rel);
    gl_PointSize = aSize * (160.0 / -mvPosition.z) * (1.0 + min(speed * 0.25, 0.8));

    // Boundary edge fade so particles don't abruptly pop at box perimeter
    float boundaryFade = smoothstep(uBoxSize * 0.5, uBoxSize * 0.35, distToCam);
    vAlpha = aBaseAlpha * boundaryFade;
  }
`;

const cosmicDustFragmentShader = `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float a = tex.a * vAlpha;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

interface CosmicDustProps {
  isMobile?: boolean;
}

export function CosmicDust({ isMobile = false }: CosmicDustProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);
  const count = isMobile ? SPACE_BUDGETS.mobile.cosmicDust : SPACE_BUDGETS.desktop.cosmicDust;
  const boxSize = SPACE_DYNAMICS.dustBoxSize;

  // Persistent vectors to avoid garbage collection in useFrame
  const prevCamPos = useRef(new THREE.Vector3());
  const camVelocity = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const mousePlaneTarget = useRef(new THREE.Vector3());
  const normalizedMouse = useRef(new THREE.Vector2(-999, -999));
  const isTouchDevice = useRef(false);

  // Buffer geometry generation
  const [geometry, material] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    const palette = [
      new THREE.Color('#dbeafe'), // Icy blue
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#fed7aa'), // Warm amber
      new THREE.Color('#c4b5fd'), // Violet
    ];

    for (let i = 0; i < count; i++) {
      // Random coordinates in box bounds
      pos[i * 3] = (Math.random() - 0.5) * boxSize;
      pos[i * 3 + 1] = (Math.random() - 0.5) * boxSize;
      pos[i * 3 + 2] = (Math.random() - 0.5) * boxSize;

      // Small gentle random drift velocity
      vel[i * 3] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // Small sizes (subtle cosmic floaters)
      sizes[i] = 0.05 + Math.random() * 0.10;
      alphas[i] = 0.25 + Math.random() * 0.35;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aBaseAlpha', new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: cosmicDustVertexShader,
      fragmentShader: cosmicDustFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uCameraPos: { value: new THREE.Vector3() },
        uCamVelocity: { value: new THREE.Vector3() },
        uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
        uMouseActive: { value: 0 },
        uTime: { value: 0 },
        uBoxSize: { value: boxSize },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [count, boxSize, circleTexture]);

  // Window pointer listener for cursor projection
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        isTouchDevice.current = true;
        normalizedMouse.current.set(-999, -999);
        return;
      }
      isTouchDevice.current = false;
      normalizedMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      normalizedMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onPointerLeave = () => {
      normalizedMouse.current.set(-999, -999);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const t = state.clock.getElapsedTime();
    const uniforms = material.uniforms;

    // 1. Camera Velocity calculation (smoothed)
    const dt = Math.max(0.001, delta);
    camVelocity.current.subVectors(camera.position, prevCamPos.current).divideScalar(dt);
    prevCamPos.current.copy(camera.position);

    // 2. Project mouse into camera-front plane (~10 units in front)
    if (!isTouchDevice.current && normalizedMouse.current.x > -900) {
      raycaster.current.setFromCamera(normalizedMouse.current, camera);
      // Plane facing camera at 10 units distance
      plane.current.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(plane.current.normal).negate(),
        camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10))
      );
      raycaster.current.ray.intersectPlane(plane.current, mousePlaneTarget.current);
      uniforms.uMouseWorld.value.copy(mousePlaneTarget.current);
      uniforms.uMouseActive.value = 1.0;
    } else {
      uniforms.uMouseActive.value = 0.0;
    }

    // 3. Update core uniforms
    uniforms.uTime.value = t;
    uniforms.uCameraPos.value.copy(camera.position);
    uniforms.uCamVelocity.value.copy(camVelocity.current);

    // 4. Adaptive quality draw range
    const quality = spaceStore.getState().qualityLevel;
    const ratio = quality === 'low' ? 0.4 : quality === 'medium' ? 0.65 : 1.0;
    geometry.setDrawRange(0, Math.floor(count * ratio));
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
