'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio, SECTIONS_ORDER } from '@/context/PortfolioContext';

export function SingleOrbitTrack() {
  const { sectionIndex, isReducedMotion } = usePortfolio();
  const trackRef = useRef<THREE.Mesh>(null);
  const activeNodeRef = useRef<THREE.Group>(null);

  // Perfectly scaled orbit radius to fit the right cosmic viewport
  const RADIUS = 4.2;

  // 8 section waypoints along the single orbit line
  const waypoints = useMemo(() => {
    return SECTIONS_ORDER.map((_, i) => {
      const theta = i * ((Math.PI * 2) / SECTIONS_ORDER.length);
      return {
        index: i,
        pos: [Math.sin(theta) * RADIUS, 0, Math.cos(theta) * RADIUS] as [number, number, number],
      };
    });
  }, [RADIUS]);

  useFrame((state) => {
    if (isReducedMotion) return;
    const time = state.clock.getElapsedTime();

    // Subtle breathing glow on active waypoint node
    if (activeNodeRef.current) {
      const s = 1.0 + Math.sin(time * 3.5) * 0.15;
      activeNodeRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* 1. EXACTLY ONE Clean Single Orbit Track Line */}
      <mesh ref={trackRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.02, 12, 180]} />
        <meshBasicMaterial
          color="#1ad1d7"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Soft Track Glow Aura */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.045, 8, 120]} />
        <meshBasicMaterial
          color="#083842"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. The 8 Waypoint Nodes along the Single Track */}
      {waypoints.map((wp) => {
        const isActive = wp.index === sectionIndex;
        return (
          <group
            key={wp.index}
            position={wp.pos}
            ref={isActive ? activeNodeRef : undefined}
          >
            {/* Core Node Marker */}
            <mesh>
              <sphereGeometry args={[isActive ? 0.08 : 0.038, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? '#62fbff' : '#175463'}
                transparent
                opacity={isActive ? 1.0 : 0.6}
              />
            </mesh>

            {/* Active Waypoint Halo */}
            {isActive && (
              <mesh>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshBasicMaterial
                  color="#1cd6e0"
                  transparent
                  opacity={0.45}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
