'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getParticleCircleTexture } from '@/lib/particle-texture';
import { usePortfolio } from '@/context/PortfolioContext';

export function SolarSun() {
  const corePointsRef = useRef<THREE.Points>(null);
  const flaresRef = useRef<THREE.Points>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);
  const { isReducedMotion } = usePortfolio();

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);

  const CORE_COUNT = 3200;
  const FLARE_COUNT = 900;
  const SUN_RADIUS = 1.05;

  // Concentrated glowing Sun core particles
  const [corePositions, coreColors] = useMemo(() => {
    const pos = new Float32Array(CORE_COUNT * 3);
    const col = new Float32Array(CORE_COUNT * 3);

    for (let i = 0; i < CORE_COUNT; i++) {
      // Concentrated density towards the center
      const u = Math.random();
      const r = Math.pow(u, 1.8) * SUN_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // White-hot radiant center blending into deep cyan sculk edge
      const heat = 1.0 - r / SUN_RADIUS; // 1 at center, 0 at edge
      col[i * 3] = 0.55 + heat * 0.45;     // Red/White
      col[i * 3 + 1] = 0.90 + heat * 0.10; // Green
      col[i * 3 + 2] = 1.0;                // Blue
    }
    return [pos, col];
  }, [CORE_COUNT, SUN_RADIUS]);

  // Dynamic solar prominence ejecta & flares
  const [flarePositions, flareVelocities] = useMemo(() => {
    const pos = new Float32Array(FLARE_COUNT * 3);
    const vel = new Float32Array(FLARE_COUNT * 3);

    for (let i = 0; i < FLARE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SUN_RADIUS * (1.0 + Math.random() * 0.9);

      const dirX = Math.sin(phi) * Math.cos(theta);
      const dirY = Math.sin(phi) * Math.sin(theta);
      const dirZ = Math.cos(phi);

      pos[i * 3] = dirX * r;
      pos[i * 3 + 1] = dirY * r;
      pos[i * 3 + 2] = dirZ * r;

      vel[i * 3] = dirX * (0.008 + Math.random() * 0.015);
      vel[i * 3 + 1] = dirY * (0.008 + Math.random() * 0.015);
      vel[i * 3 + 2] = dirZ * (0.008 + Math.random() * 0.015);
    }
    return [pos, vel];
  }, [FLARE_COUNT, SUN_RADIUS]);

  useFrame((state) => {
    if (isReducedMotion) return;
    const time = state.clock.getElapsedTime();

    // Axial rotation of the solar core
    if (corePointsRef.current) {
      corePointsRef.current.rotation.y = time * 0.12;
      corePointsRef.current.rotation.z = Math.sin(time * 0.05) * 0.08;
    }

    // Gentle pulsating breath of the solar corona
    if (coronaRef.current) {
      const scale = 1.0 + Math.sin(time * 1.5) * 0.04;
      coronaRef.current.scale.set(scale, scale, scale);
    }
    if (corona2Ref.current) {
      const scale2 = 1.0 + Math.cos(time * 1.2) * 0.06;
      corona2Ref.current.scale.set(scale2, scale2, scale2);
    }

    // Dynamic solar flares pulsing outward and returning
    if (flaresRef.current) {
      flaresRef.current.rotation.y = -time * 0.18;
      const posAttr = flaresRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < FLARE_COUNT; i++) {
        const i3 = i * 3;
        array[i3] += flareVelocities[i3];
        array[i3 + 1] += flareVelocities[i3 + 1];
        array[i3 + 2] += flareVelocities[i3 + 2];

        // Reset flare if it travelled beyond corona radius
        const distSq =
          array[i3] * array[i3] + array[i3 + 1] * array[i3 + 1] + array[i3 + 2] * array[i3 + 2];
        if (distSq > (SUN_RADIUS * 2.2) ** 2) {
          array[i3] *= 0.5;
          array[i3 + 1] *= 0.5;
          array[i3 + 2] *= 0.5;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Powerful Central Solar Point Light (casts physical day/night shadow onto the planet) */}
      <pointLight position={[0, 0, 0]} intensity={7.0} color="#8cfaff" distance={80} decay={1.7} />
      <pointLight position={[0, 0, 0]} intensity={3.5} color="#ffffff" distance={30} decay={2.0} />

      {/* 2. White-Hot Radiant Core Points */}
      <points ref={corePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[corePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[coreColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.062}
          sizeAttenuation
          map={circleTexture || undefined}
          vertexColors
          transparent
          opacity={0.98}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Dynamic Solar Flare Ejecta */}
      <points ref={flaresRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flarePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          sizeAttenuation
          map={circleTexture || undefined}
          color="#2df2ff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 4. Radiant Inner Corona Sphere */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[SUN_RADIUS * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#38f1ff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Deep Cosmic Solar Atmosphere Halo */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[SUN_RADIUS * 1.7, 32, 32]} />
        <meshBasicMaterial
          color="#0f5a6b"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
