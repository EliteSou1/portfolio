'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/context/PortfolioContext';
import { getParticleCircleTexture } from '@/lib/particle-texture';

interface OrbitRingProps {
  radiusX: number;
  radiusZ: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  particleCount: number;
  color: string;
  opacity: number;
}

function OrbitTrack({ radiusX, tiltX, tiltZ, speed, particleCount, color, opacity }: OrbitRingProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { isReducedMotion } = usePortfolio();

  // Create orbiting particles along this specific ring
  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const offs = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radiusX;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * radiusX;
      offs[i] = angle;
    }
    return [pos, offs];
  }, [particleCount, radiusX]);

  useFrame((state) => {
    if (isReducedMotion) return;
    const time = state.clock.getElapsedTime() * speed;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time;
    }
  });

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);

  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      {/* Delicate orbital ring geometry using Torus */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radiusX, 0.015, 6, 96]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.35} />
      </mesh>

      {/* Orbiting stardust along the trajectory */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          map={circleTexture || undefined}
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function OrbitalRings() {
  // Configured orbits for sections
  const orbits = useMemo(() => [
    { radiusX: 6.8, radiusZ: 6.2, tiltX: 0.22, tiltZ: -0.15, speed: 0.08, particleCount: 160, color: '#1ad1d7', opacity: 0.5 },
    { radiusX: 10.5, radiusZ: 9.8, tiltX: -0.18, tiltZ: 0.25, speed: -0.06, particleCount: 220, color: '#257a8a', opacity: 0.45 },
    { radiusX: 14.8, radiusZ: 13.9, tiltX: 0.3, tiltZ: 0.1, speed: 0.045, particleCount: 280, color: '#165768', opacity: 0.4 },
    { radiusX: 19.4, radiusZ: 18.2, tiltX: -0.25, tiltZ: -0.2, speed: -0.035, particleCount: 340, color: '#1b414d', opacity: 0.35 },
    { radiusX: 24.2, radiusZ: 23.0, tiltX: 0.15, tiltZ: 0.35, speed: 0.025, particleCount: 400, color: '#12303a', opacity: 0.3 },
  ], []);

  return (
    <group>
      {orbits.map((orb, idx) => (
        <OrbitTrack key={idx} {...orb} />
      ))}
    </group>
  );
}
