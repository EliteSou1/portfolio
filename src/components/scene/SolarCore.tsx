'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/context/PortfolioContext';
import { getParticleCircleTexture } from '@/lib/particle-texture';

export function SolarCore() {
  const { coreConfig, activeSection, isReducedMotion } = usePortfolio();

  const pointsRef = useRef<THREE.Points>(null);
  const outerOrbitsRef = useRef<THREE.Points>(null);
  const innerEmberRef = useRef<THREE.Points>(null);

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);

  // Smooth interpolated target values
  const currentSpeed = useRef(coreConfig.speed);
  const currentRadius = useRef(coreConfig.radius);
  const currentDispersion = useRef(coreConfig.dispersion);
  const currentColor = useRef(new THREE.Color(...coreConfig.colorTint));

  const COUNT = 3600;
  const OUTER_COUNT = 800;
  const INNER_EMBER_COUNT = 450;

  // Generate main core particle sphere with noise distribution
  const [positions, originalPositions, randomFactors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const orig = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const rVariation = 0.85 + Math.random() * 0.35;
      const x = Math.sin(phi) * Math.cos(theta) * rVariation;
      const y = Math.sin(phi) * Math.sin(theta) * rVariation;
      const z = Math.cos(phi) * rVariation;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      rnd[i * 3] = Math.random() * 2 - 1;
      rnd[i * 3 + 1] = 0.5 + Math.random() * 1.5;
      rnd[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    return [pos, orig, rnd];
  }, [COUNT]);

  // Generate outer orbital fragment particles
  const outerPositions = useMemo(() => {
    const pos = new Float32Array(OUTER_COUNT * 3);
    for (let i = 0; i < OUTER_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4.2 + Math.random() * 2.8;
      const height = (Math.random() - 0.5) * 1.6;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [OUTER_COUNT]);

  // Inner compressed fiery ember particles
  const innerPositions = useMemo(() => {
    const pos = new Float32Array(INNER_EMBER_COUNT * 3);
    for (let i = 0; i < INNER_EMBER_COUNT; i++) {
      const u = Math.random();
      const r = Math.cbrt(u) * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [INNER_EMBER_COUNT]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const lerpSpeed = delta * 2.5;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, coreConfig.speed, lerpSpeed);
    currentRadius.current = THREE.MathUtils.lerp(currentRadius.current, coreConfig.radius, lerpSpeed);
    currentDispersion.current = THREE.MathUtils.lerp(currentDispersion.current, coreConfig.dispersion, lerpSpeed);

    const targetCol = new THREE.Color(...coreConfig.colorTint);
    currentColor.current.lerp(targetCol, lerpSpeed);

    const time = isReducedMotion ? 0.5 : state.clock.getElapsedTime() * currentSpeed.current;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const rad = currentRadius.current;
    const disp = currentDispersion.current;
    const isContact = activeSection === 'contact';

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      const seedX = randomFactors[i3];
      const freq = randomFactors[i3 + 1];
      const phase = randomFactors[i3 + 2];

      const pulseWave = Math.sin(time * 1.4 + phase) * 0.12 * disp;
      const distortion = Math.cos(oy * 2.5 + time * 2.0 * freq) * 0.15 * disp;

      let factor = rad + pulseWave + distortion;
      if (isContact) {
        const sink = Math.sin(time * 3.0 + i * 0.05) * 0.3;
        factor = Math.max(1.2, factor * 0.7 + sink);
      }

      posArray[i3] = ox * factor + seedX * 0.08;
      posArray[i3 + 1] = oy * factor;
      posArray[i3 + 2] = oz * factor;
    }

    posAttr.needsUpdate = true;

    pointsRef.current.rotation.y = time * 0.2;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.15;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.color.copy(currentColor.current);

    if (outerOrbitsRef.current) {
      outerOrbitsRef.current.rotation.y = -time * 0.35;
      outerOrbitsRef.current.rotation.z = Math.cos(time * 0.15) * 0.12;
      const outerMat = outerOrbitsRef.current.material as THREE.PointsMaterial;
      outerMat.color.copy(currentColor.current).offsetHSL(0.04, -0.1, 0.1);
    }

    if (innerEmberRef.current) {
      innerEmberRef.current.rotation.y = time * 0.5;
      const emberPulse = 1.0 + Math.sin(time * coreConfig.pulseSpeed * 2.0) * 0.15;
      innerEmberRef.current.scale.setScalar(emberPulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Breathing Sculk Solar Core */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          sizeAttenuation
          map={circleTexture || undefined}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Outer Orbiting Shards / Soft Circular Embers */}
      <points ref={outerOrbitsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[outerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.085}
          sizeAttenuation
          map={circleTexture || undefined}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Deep Internal Energy Kernel */}
      <points ref={innerEmberRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[innerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          sizeAttenuation
          map={circleTexture || undefined}
          transparent
          opacity={0.98}
          color="#3bf2ff"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
