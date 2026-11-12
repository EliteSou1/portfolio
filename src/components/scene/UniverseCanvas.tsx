'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { TelemetryTracker } from './TelemetryTracker';
import { CameraRig } from './CameraRig';
import { useDebugStore } from './debugStore';
import { spaceStore } from './space/spaceStore';
import { usePortfolio } from '@/context/PortfolioContext';
import { SPACE_ZONES } from '@/lib/spaceConfig';

// Deep Space System Layers
import { Galaxy } from './space/Galaxy';
import { BackgroundStars } from './space/BackgroundStars';
import { CosmicDust } from './space/CosmicDust';
import { ShootingStars } from './space/ShootingStars';
import { Comet } from './space/Comet';
import { AsteroidField } from './space/AsteroidField';
import { NebulaZone } from './space/NebulaZone';
import { Supernova } from './space/Supernova';

class SceneBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function UniverseCanvas() {
  const customDpr = useDebugStore((s) => s.dpr);
  const isDebug = useDebugStore((s) => s.enabled);
  const [adaptiveDpr, setAdaptiveDpr] = useState<number>(1.5);
  const { isMobile, isReducedMotion } = usePortfolio();
  const [contextLost, setContextLost] = useState(false);
  const contextCleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => { contextCleanup.current?.(); }, []);

  const activeDpr = isDebug ? customDpr : adaptiveDpr;

  return (
    <div
      translate="no"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none cosmic-backdrop"
    >
      {!isReducedMotion && !contextLost && <SceneBoundary>
        <Canvas
          camera={{ position: [1.8, 6.5, 9.2], fov: 50, near: 0.1, far: 850 }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          dpr={isMobile ? Math.min(activeDpr, 1.25) : activeDpr}
          fallback={null}
          onCreated={({ gl }) => {
            contextCleanup.current?.();
            const canvas = gl.domElement;
            const onLost = () => setContextLost(true);
            canvas.addEventListener('webglcontextlost', onLost, { once: true });
            contextCleanup.current = () => canvas.removeEventListener('webglcontextlost', onLost);
          }}
        >
          {/* Adaptive Quality Performance Monitor */}
          <PerformanceMonitor
            onDecline={() => {
              const current = spaceStore.getState().qualityLevel;
              if (current === 'high') {
                spaceStore.setQualityLevel('medium');
                setAdaptiveDpr(1.25);
              } else if (current === 'medium') {
                spaceStore.setQualityLevel('low');
                setAdaptiveDpr(1.0);
              }
            }}
            onIncline={() => {
              const current = spaceStore.getState().qualityLevel;
              if (current === 'low') {
                spaceStore.setQualityLevel('medium');
                setAdaptiveDpr(1.25);
              } else if (current === 'medium') {
                spaceStore.setQualityLevel('high');
                setAdaptiveDpr(1.5);
              }
            }}
          />

          <color attach="background" args={['#000103']} />

          {/* Deep space cosmic ambient fill */}
          <ambientLight intensity={0.15} color="#050a12" />

          <Suspense fallback={null}>
            {/* Telemetry and GPU Draw Call Tracker */}
            <TelemetryTracker />

            {/* 1. Origin: 60k Particle Spiral Galaxy */}
            <Galaxy isMobile={isMobile} />

            {/* 2. Pristine Background Stars: 4,000 spectral stars + 4 diffraction spikes */}
            <BackgroundStars isMobile={isMobile} />

            {/* 3. Near-Camera Cosmic Dust Box with Modular Wrap & Mouse Repulsion */}
            <CosmicDust isMobile={isMobile} />

            {/* 4. GPU-Accelerated Shooting Stars (8 pooled instances) */}
            <ShootingStars isMobile={isMobile} />

            {/* 5. Autonomous Sweeping Deep Space Comet with Ionic Tail */}
            <Comet isMobile={isMobile} />

            {/* 6. Asteroid Belt Zone: 3 Instanced Meshes + Lighting & Tumble + Rock Dust */}
            <AsteroidField isMobile={isMobile} />

            {/* 7. Deep Space Nebulae Zones with Dark Dust Silhouettes */}
            {/* Nebula A (Magenta - Violet) */}
            <NebulaZone
              id="nebulaA"
              position={SPACE_ZONES.nebulaA.position.toArray()}
              primaryColor={SPACE_ZONES.nebulaA.palette.primary}
              secondaryColor={SPACE_ZONES.nebulaA.palette.secondary}
              darkDustColor={SPACE_ZONES.nebulaA.palette.darkDust}
              cullDistance={SPACE_ZONES.nebulaA.cullDistance}
              starCount={isMobile ? 150 : 300}
            />

            {/* Nebula B (Turquoise - Azure Blue) */}
            <NebulaZone
              id="nebulaB"
              position={SPACE_ZONES.nebulaB.position.toArray()}
              primaryColor={SPACE_ZONES.nebulaB.palette.primary}
              secondaryColor={SPACE_ZONES.nebulaB.palette.secondary}
              darkDustColor={SPACE_ZONES.nebulaB.palette.darkDust}
              cullDistance={SPACE_ZONES.nebulaB.cullDistance}
              starCount={isMobile ? 150 : 300}
            />

            {/* Nebula C (Gold - Amber) [Desktop only, mobile renders 2 nebulas] */}
            {!isMobile && (
              <NebulaZone
                id="nebulaC"
                position={SPACE_ZONES.nebulaC.position.toArray()}
                primaryColor={SPACE_ZONES.nebulaC.palette.primary}
                secondaryColor={SPACE_ZONES.nebulaC.palette.secondary}
                darkDustColor={SPACE_ZONES.nebulaC.palette.darkDust}
                cullDistance={SPACE_ZONES.nebulaC.cullDistance}
                starCount={300}
              />
            )}

            {/* 8. Supernova desactivada inicialmente para sobriedad y evitar destellos transitorios */}

            {/* 9. Intelligent Camera Voyager */}
            <CameraRig />
          </Suspense>
        </Canvas>
      </SceneBoundary>}
    </div>
  );
}
