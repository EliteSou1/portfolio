'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS, SPACE_DYNAMICS, SPACE_ZONES, JOURNEY_PATH } from '@/lib/spaceConfig';
import { spaceStore } from './spaceStore';
import { getParticleCircleTexture } from '@/lib/particle-texture';

const asteroidVertexShader = `
  uniform float uTime;
  attribute vec3 aTumbleAxis;
  attribute float aTumbleSpeed;
  attribute vec3 aColorTint;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vColor;

  // Rodrigues rotation formula around arbitrary unit axis
  vec3 rotateAxis(vec3 v, vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }

  void main() {
    vColor = aColorTint;

    // 1. Autonomous tumble rotation calculated entirely in GPU
    float angle = uTime * aTumbleSpeed;
    vec3 rotatedPos = rotateAxis(position, aTumbleAxis, angle);
    vec3 rotatedNorm = rotateAxis(normal, aTumbleAxis, angle);

    // 2. Transform by instance matrix
    vec4 instanceLocalPos = instanceMatrix * vec4(rotatedPos, 1.0);
    vec4 worldPos = modelMatrix * instanceLocalPos;
    vWorldPos = worldPos.xyz;

    // Normal transformation with smooth interpolation
    mat3 normMat = mat3(modelMatrix * instanceMatrix);
    vNormal = normalize(normMat * rotatedNorm);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const asteroidFragmentShader = `
  uniform vec3 uSunPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vColor;

  void main() {
    vec3 norm = normalize(vNormal);

    // 1. Warm Directional Sunlight towards Galactic Core (0, 0, 0)
    vec3 sunDir = normalize(uSunPosition - vWorldPos);
    float NdotL = max(0.0, dot(norm, sunDir));
    vec3 sunLight = vec3(1.0, 0.94, 0.82) * pow(NdotL, 1.15);

    // 2. Cool Violet Fill Light from deep space
    vec3 fillDir = normalize(vec3(-0.4, 0.7, -0.6));
    float NdotFill = max(0.0, dot(norm, fillDir));
    vec3 fillLight = vec3(0.38, 0.22, 0.58) * (NdotFill * 0.52);

    // 3. Low Ambient Base
    vec3 ambient = vec3(0.06, 0.06, 0.08);

    // 4. Warm Rim Light towards Galactic Core
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float rimFacingSun = max(0.0, dot(norm, sunDir) + 0.35);
    float rim = pow(1.0 - max(0.0, dot(norm, viewDir)), 2.4) * rimFacingSun;
    vec3 rimLight = vec3(1.0, 0.86, 0.65) * (rim * 0.75);

    // 5. Subtle micro-relief
    float craterNoise = sin(vWorldPos.x * 3.2) * sin(vWorldPos.y * 3.2) * sin(vWorldPos.z * 3.2);
    vec3 rockDiffuse = vColor * (0.90 + craterNoise * 0.10);

    vec3 finalLinear = rockDiffuse * (sunLight + fillLight + ambient) + rimLight;
    gl_FragColor = vec4(finalLinear, 1.0);

    #include <colorspace_fragment>
  }
`;

interface AsteroidFieldProps {
  isMobile?: boolean;
}

export function AsteroidField({ isMobile = false }: AsteroidFieldProps) {
  const beltGroupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);
  const center = SPACE_ZONES.asteroids.position;
  const cullDistance = SPACE_ZONES.asteroids.cullDistance;

  const totalAsteroids = isMobile
    ? SPACE_BUDGETS.mobile.asteroidsTotal
    : SPACE_BUDGETS.desktop.asteroidsTotal;

  // Split across 3 variants: ~170, ~170, ~160
  const variantCounts = useMemo(() => {
    const v1 = Math.floor(totalAsteroids / 3);
    const v2 = Math.floor(totalAsteroids / 3);
    const v3 = totalAsteroids - v1 - v2;
    return [v1, v2, v3];
  }, [totalAsteroids]);

  // 1. Bake 3 distinct smooth irregular rock geometries with low-frequency noise (no flat shading)
  const rockGeometries = useMemo(() => {
    return [0, 1, 2].map((seed) => {
      // Subdivided icosahedron for smooth curvature
      const geo = new THREE.IcosahedronGeometry(1.0, 2);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Low frequency organic noise
        const n =
          Math.sin(x * 1.8 + seed * 1.4) *
          Math.cos(y * 1.6 - seed * 0.9) *
          Math.sin(z * 1.9 + seed * 2.2);

        const displacement = 1.0 + n * 0.22;
        pos.setXYZ(i, x * displacement, y * displacement, z * displacement);
      }

      geo.computeVertexNormals();
      return geo;
    });
  }, []);

  // Shared Asteroid Shader Material with linear color pipeline
  const asteroidMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: asteroidVertexShader,
      fragmentShader: asteroidFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
      },
    });
  }, []);

  // 2. Sample path trajectory points around asteroid zone to guarantee 14+ unit clearance
  const pathWaypoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let t = 0.35; t <= 0.75; t += 0.02) {
      pts.push(JOURNEY_PATH.getPoint(t));
    }
    return pts;
  }, []);

  // 3. Generate instance transforms & attributes distributed in toroidal belt
  const meshData = useMemo(() => {
    // Albedo palette: Gris pardo (#5d5560) a ocre (#8a6f55) and warm chondrite
    const palette = [
      new THREE.Color('#5d5560').convertSRGBToLinear(), // Gris pardo
      new THREE.Color('#8a6f55').convertSRGBToLinear(), // Ocre cálido
      new THREE.Color('#746558').convertSRGBToLinear(), // Chondrite medio
      new THREE.Color('#4d4554').convertSRGBToLinear(), // Pardo violeta
      new THREE.Color('#947b64').convertSRGBToLinear(), // Ocre luminoso
    ];

    const tempMat = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const worldPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    return variantCounts.map((vCount) => {
      const matrices = new Float32Array(vCount * 16);
      const tumbleAxes = new Float32Array(vCount * 3);
      const tumbleSpeeds = new Float32Array(vCount);
      const colorTints = new Float32Array(vCount * 3);

      for (let i = 0; i < vCount; i++) {
        let safe = false;
        let attempts = 0;

        let r = 18.0;
        let theta = 0;
        let y = 0;

        // Ensure no rock is within 14 units of JOURNEY_PATH, clearing the camera field
        while (!safe && attempts < 25) {
          attempts++;

          // Density lower in center of frame (sin(theta) near 0 is cleared, pushed to flanks)
          theta = Math.random() * Math.PI * 2;
          const centerBias = Math.abs(Math.sin(theta));
          if (centerBias < 0.28) {
            // Push towards flanks
            theta += (Math.random() < 0.5 ? 0.45 : -0.45);
          }

          // Torus radius: 18 to 38 units
          r = 18.0 + Math.pow(Math.random(), 0.9) * 20.0;
          y = THREE.MathUtils.randFloatSpread(6.5) * Math.pow(Math.random(), 1.3);

          tempPos.set(r * Math.cos(theta), y, r * Math.sin(theta));
          worldPos.copy(center).add(tempPos);

          // Check clearance to all path waypoints
          let minDist = 999;
          for (let p = 0; p < pathWaypoints.length; p++) {
            const d = worldPos.distanceTo(pathWaypoints[p]);
            if (d < minDist) minDist = d;
          }

          if (minDist >= 14.0) {
            safe = true;
          }
        }

        // Reduced scale to ~35–50 %: 0.18 to 0.48, with rare hero rocks max 1.15
        const isHero = Math.random() < 0.05;
        let scaleVal: number;
        if (isHero) {
          scaleVal = 0.85 + Math.random() * 0.35;
        } else {
          scaleVal = 0.18 + Math.pow(Math.random(), 1.2) * 0.30;
        }

        tempQuat.setFromEuler(
          new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          )
        );

        tempScale.set(
          scaleVal * (0.85 + Math.random() * 0.3),
          scaleVal * (0.85 + Math.random() * 0.3),
          scaleVal * (0.85 + Math.random() * 0.3)
        );

        tempMat.compose(tempPos, tempQuat, tempScale);
        tempMat.toArray(matrices, i * 16);

        // Random unit tumble axis
        const tAxis = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();
        tumbleAxes[i * 3] = tAxis.x;
        tumbleAxes[i * 3 + 1] = tAxis.y;
        tumbleAxes[i * 3 + 2] = tAxis.z;

        tumbleSpeeds[i] = THREE.MathUtils.randFloat(
          SPACE_DYNAMICS.asteroidTumbleSpeedMin * 0.8,
          SPACE_DYNAMICS.asteroidTumbleSpeedMax * 0.8
        );

        const col = palette[Math.floor(Math.random() * palette.length)];
        colorTints[i * 3] = col.r;
        colorTints[i * 3 + 1] = col.g;
        colorTints[i * 3 + 2] = col.b;
      }

      return {
        matrices,
        tumbleAxes,
        tumbleSpeeds,
        colorTints,
      };
    });
  }, [variantCounts, center, pathWaypoints]);

  // 4. Ambient Rock Dust Field (2,000 points) within belt
  const dustCount = isMobile
    ? SPACE_BUDGETS.mobile.asteroidDust
    : SPACE_BUDGETS.desktop.asteroidDust;

  const [dustGeometry, dustMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const col = new Float32Array(dustCount * 3);
    const sizes = new Float32Array(dustCount);

    const dustCol = new THREE.Color('#8a6f55').convertSRGBToLinear();

    for (let i = 0; i < dustCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 16.0 + Math.random() * 24.0;
      const y = THREE.MathUtils.randFloatSpread(7.5) * Math.pow(Math.random(), 1.2);

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      const brightness = 0.25 + Math.random() * 0.5;
      col[i * 3] = dustCol.r * brightness;
      col[i * 3 + 1] = dustCol.g * brightness;
      col[i * 3 + 2] = dustCol.b * brightness;

      sizes[i] = 0.035 + Math.random() * 0.06;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      map: circleTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      opacity: 0.35,
    });

    return [geo, mat];
  }, [dustCount, circleTexture]);

  // InstancedMesh references
  const instancedMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);

  // Initialize instanced buffers on mount
  React.useEffect(() => {
    meshData.forEach((data, idx) => {
      const mesh = instancedMeshRefs.current[idx];
      if (!mesh) return;

      mesh.instanceMatrix.needsUpdate = true;

      const aAxis = new THREE.InstancedBufferAttribute(data.tumbleAxes, 3);
      const aSpeed = new THREE.InstancedBufferAttribute(data.tumbleSpeeds, 1);
      const aColor = new THREE.InstancedBufferAttribute(data.colorTints, 3);

      mesh.geometry.setAttribute('aTumbleAxis', aAxis);
      mesh.geometry.setAttribute('aTumbleSpeed', aSpeed);
      mesh.geometry.setAttribute('aColorTint', aColor);
    });
  }, [meshData]);

  useFrame((state) => {
    if (!beltGroupRef.current) return;

    // 1. Zone Culling: Hide belt if camera is far away
    const dist = camera.position.distanceTo(center);
    const isVisible = dist <= cullDistance;

    if (beltGroupRef.current.visible !== isVisible) {
      beltGroupRef.current.visible = isVisible;
      spaceStore.getState().cullStatus.asteroids = isVisible;
    }

    if (!isVisible) return;

    const t = state.clock.getElapsedTime();

    // 2. Slow majestic rotation of entire belt ring around its local axis
    beltGroupRef.current.rotation.y = t * (SPACE_DYNAMICS.beltRotationSpeed * 0.7);

    // 3. Update uniform uTime for GPU tumbling
    asteroidMaterial.uniforms.uTime.value = t;

    // 4. Adaptive quality draw range
    const quality = spaceStore.getState().qualityLevel;
    const ratio = quality === 'low' ? 0.4 : quality === 'medium' ? 0.65 : 1.0;
    dustGeometry.setDrawRange(0, Math.floor(dustCount * ratio));

    instancedMeshRefs.current.forEach((mesh, idx) => {
      if (mesh) {
        const count = variantCounts[idx];
        mesh.count = Math.floor(count * ratio);
      }
    });
  });

  return (
    <group ref={beltGroupRef} position={center.toArray()}>
      {rockGeometries.map((geo, idx) => (
        <instancedMesh
          key={idx}
          ref={(el) => {
            instancedMeshRefs.current[idx] = el;
          }}
          args={[geo, asteroidMaterial, variantCounts[idx]]}
          frustumCulled={false}
          onUpdate={(self) => {
            self.instanceMatrix.array.set(meshData[idx].matrices);
            self.instanceMatrix.needsUpdate = true;
          }}
        />
      ))}

      {/* Ambient rock dust particles */}
      <points ref={dustRef} geometry={dustGeometry} material={dustMaterial} />
    </group>
  );
}
