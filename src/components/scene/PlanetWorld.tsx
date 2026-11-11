'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/context/PortfolioContext';
import { getParticleCircleTexture } from '@/lib/particle-texture';

export function PlanetWorld() {
  const { orbitalAngle, isReducedMotion } = usePortfolio();
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);

  // 24,000 dense particles forming a rich, cohesive spherical planet
  const PARTICLE_COUNT = 24000;
  const PLANET_RADIUS = 1.35;
  const ORBIT_RADIUS = 4.2;

  // 100% STABLE planet geometry (does NOT mutate or reform when moving between sections)
  const [positions, normals, originalColors, baseColors, elevationTypes] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const nrm = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const baseCol = new Float32Array(PARTICLE_COUNT * 3);
    const elev = new Uint8Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Golden ratio Fibonacci sphere distribution for uniform particle packing
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Stable spherical harmonic elevation - creates distinct continents, trenches, and sculk rifts
      const harmonic1 = Math.sin(theta * 3.0) * Math.cos(phi * 2.0);
      const harmonic2 = Math.sin(theta * 7.0 + phi * 4.0) * 0.5;
      const harmonic3 = Math.cos(theta * 13.0 - phi * 8.0) * 0.25;
      const terrain = harmonic1 * 0.08 + harmonic2 * 0.04 + harmonic3 * 0.02;

      const r = PLANET_RADIUS * (1.0 + terrain);

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);

      pos[i * 3] = nx * r;
      pos[i * 3 + 1] = ny * r;
      pos[i * 3 + 2] = nz * r;

      nrm[i * 3] = nx;
      nrm[i * 3 + 1] = ny;
      nrm[i * 3 + 2] = nz;

      // Determine geographic terrain type
      if (Math.abs(harmonic1 + harmonic2) > 0.62) {
        // Ancient Sculk Bioluminescent Vein
        elev[i] = 2;
        baseCol[i * 3] = 0.22;
        baseCol[i * 3 + 1] = 0.95;
        baseCol[i * 3 + 2] = 1.0;
      } else if (terrain > 0.035) {
        // High Continental Mountain Peaks
        elev[i] = 3;
        baseCol[i * 3] = 0.42;
        baseCol[i * 3 + 1] = 0.74;
        baseCol[i * 3 + 2] = 0.85;
      } else if (terrain > -0.02) {
        // Ancient Stone Continental Bedrock
        elev[i] = 1;
        baseCol[i * 3] = 0.16;
        baseCol[i * 3 + 1] = 0.42;
        baseCol[i * 3 + 2] = 0.52;
      } else {
        // Deep Abyssal Oceanic Trench
        elev[i] = 0;
        baseCol[i * 3] = 0.06;
        baseCol[i * 3 + 1] = 0.20;
        baseCol[i * 3 + 2] = 0.28;
      }

      col[i * 3] = baseCol[i * 3];
      col[i * 3 + 1] = baseCol[i * 3 + 1];
      col[i * 3 + 2] = baseCol[i * 3 + 2];
    }

    return [pos, nrm, col, baseCol, elev];
  }, [PARTICLE_COUNT, PLANET_RADIUS]);

  // Smooth position interpolation along the single orbit track
  const currentAngle = useRef<number>(0);
  const lightDir = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!groupRef.current || !pointsRef.current) return;

    // Smoothly travel along the single orbit line
    const angleSpeed = isReducedMotion ? 0.3 : 0.085;
    let diff = orbitalAngle - currentAngle.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentAngle.current += diff * THREE.MathUtils.clamp(angleSpeed * (delta * 60), 0, 1);

    const theta = currentAngle.current;

    // Planet position along the single orbit ring
    const px = Math.sin(theta) * ORBIT_RADIUS;
    const pz = Math.cos(theta) * ORBIT_RADIUS;
    const py = 0;

    groupRef.current.position.set(px, py, pz);

    // Natural steady axial spin of the planet (constant, stable rotation)
    const rotSpeed = isReducedMotion ? 0 : state.clock.getElapsedTime() * 0.07;
    pointsRef.current.rotation.y = rotSpeed;

    // --- REALISTIC DYNAMIC SHADOW GENERATION ---
    // The central Sun is at [0, 0, 0]. Vector from Planet toward the Sun:
    lightDir.current.set(-px, -py, -pz).normalize();

    // Rotate light inversely by planet axial rotation to calculate local Lambertian solar angle
    const invRot = -rotSpeed;
    const cosR = Math.cos(invRot);
    const sinR = Math.sin(invRot);
    const localLightX = lightDir.current.x * cosR - lightDir.current.z * sinR;
    const localLightY = lightDir.current.y;
    const localLightZ = lightDir.current.x * sinR + lightDir.current.z * cosR;

    // Direct typed array buffer mutation for max performance (60+ FPS)
    const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const colorArray = colorAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const nx = normals[i3];
      const ny = normals[i3 + 1];
      const nz = normals[i3 + 2];

      // Lambertian dot product: N · L_sun
      const dot = nx * localLightX + ny * localLightY + nz * localLightZ;
      const terrainType = elevationTypes[i];

      if (dot > 0.06) {
        // --- DAY SIDE (Illuminated directly by the Sun) ---
        const illumination = Math.min(1.0, dot * 1.45);
        const dayBoost = 0.42 + illumination * 0.95;

        colorArray[i3] = Math.min(1.0, baseColors[i3] * dayBoost);
        colorArray[i3 + 1] = Math.min(1.0, baseColors[i3 + 1] * dayBoost);
        colorArray[i3 + 2] = Math.min(1.0, baseColors[i3 + 2] * dayBoost);
      } else if (dot >= -0.08) {
        // --- TERMINATOR LINE (Sunset/Sunrise twilight threshold) ---
        // Ancient sculk resonance activates along the twilight boundary
        const twilightCyan = 0.38 + (1 - Math.abs(dot) / 0.08) * 0.55;

        colorArray[i3] = baseColors[i3] * 0.25;
        colorArray[i3 + 1] = Math.max(baseColors[i3 + 1] * 0.4, twilightCyan);
        colorArray[i3 + 2] = Math.max(baseColors[i3 + 2] * 0.45, twilightCyan * 1.15);
      } else {
        // --- NIGHT SIDE / SHADOW (In celestial shadow) ---
        // Deep shadow with faint ancient sculk bioluminescence
        const isSculk = terrainType === 2;
        const nightBase = isSculk ? 0.22 : 0.035;

        colorArray[i3] = baseColors[i3] * nightBase;
        colorArray[i3 + 1] = baseColors[i3 + 1] * (nightBase * (isSculk ? 1.35 : 1.0));
        colorArray[i3 + 2] = baseColors[i3 + 2] * (nightBase * (isSculk ? 1.65 : 1.2));
      }
    }

    colorAttr.needsUpdate = true;

    // Atmospheric outer haze
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = rotSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. 24,000 Dense Solid Particle Planet with Solar Terminator Shadow */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[originalColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.034}
          sizeAttenuation
          map={circleTexture || undefined}
          vertexColors
          transparent
          opacity={0.97}
          blending={THREE.NormalBlending}
          depthWrite={true}
        />
      </points>

      {/* 2. Soft Atmospheric Twilight Veil */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[PLANET_RADIUS * 1.035, 32, 32]} />
        <meshBasicMaterial
          color="#1ad1d7"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
