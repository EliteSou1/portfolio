'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '@/context/PortfolioContext';
import { debugStore } from './debugStore';
import { JOURNEY_PATH, LOOK_PATH, SPACE_ZONES } from '@/lib/spaceConfig';
import { spaceStore } from './space/spaceStore';

const PARALLAX_CONFIG = {
  MAX_POS_OFFSET: 0.35,
  MAX_ROT_RAD: (3.0 * Math.PI) / 180,
  DAMP_FACTOR: 0.05,
  IDLE_AMPLITUDE: 0.07,
} as const;

// Progression coordinates for each of the 8 portfolio sections
const SECTION_JOURNEY_TARGETS = [
  0.0,   // 0: Home (Hero - Galaxia)
  0.12,  // 1: About (Approaching deep space)
  0.24,  // 2: Skills (Zona Nebulosa A - Magenta/Violeta)
  0.42,  // 3: Projects (Zona Nebulosa B - Turquesa/Azul)
  0.60,  // 4: Experience (Zona Cinturón Asteroides)
  0.76,  // 5: Education (Zona Nebulosa C - Dorado/Ámbar)
  0.88,  // 6: Certifications (Deep cosmic field)
  1.0,   // 7: Contact (Singularidad / Panoramic Vault)
];

export function CameraRig() {
  const { camera } = useThree();
  const { isReducedMotion, isMobile, sectionIndex } = usePortfolio();

  // Mouse & Parallax state
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smooth voyage interpolation tracker
  const smoothVoyageT = useRef(0);

  // Target vectors (strictly reused per frame to avoid GC)
  const targetCamPos = useRef(new THREE.Vector3(1.8, 6.5, 9.2));
  const targetLookAt = useRef(new THREE.Vector3(0.3, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0.3, 0, 0));
  const persistentDesiredPos = useRef(new THREE.Vector3());
  const persistentLookOffset = useRef(new THREE.Vector3());

  // Set initial position to Hero (1.8, 6.5, 9.2) looking at (0.3, 0, 0)
  useEffect(() => {
    camera.position.copy(SPACE_ZONES.hero.cameraPosition);
    camera.lookAt(SPACE_ZONES.hero.targetLookAt);
    currentLookAt.current.copy(SPACE_ZONES.hero.targetLookAt);
    targetCamPos.current.copy(SPACE_ZONES.hero.cameraPosition);
    targetLookAt.current.copy(SPACE_ZONES.hero.targetLookAt);
  }, [camera]);

  // Mouse Parallax listener
  useEffect(() => {
    if (isMobile || isReducedMotion) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isMobile, isReducedMotion]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isDebugActive = debugStore.getState().enabled;
    const isManualJourneyScrubbed = spaceStore.getState().isJourneyActive;

    // 1. Determine Voyage Trajectory Progress:
    // Either from manual debug slider or synchronized with current active section
    let activeT: number;
    if (isDebugActive && isManualJourneyScrubbed) {
      activeT = spaceStore.getState().journeyProgress;
      smoothVoyageT.current = activeT;
    } else {
      const targetT = SECTION_JOURNEY_TARGETS[sectionIndex] ?? 0.0;
      const smoothSpeed = isReducedMotion ? 1.0 : (1 - Math.exp(-3.2 * delta));
      smoothVoyageT.current += (targetT - smoothVoyageT.current) * smoothSpeed;
      activeT = smoothVoyageT.current;
    }

    // Sample continuous Catmull-Rom flight curves
    JOURNEY_PATH.getPoint(activeT, targetCamPos.current);
    LOOK_PATH.getPoint(activeT, targetLookAt.current);

    // 2. Parallax and Idle Zero-G Breathing Offset
    const allowParallax = !isReducedMotion && !isMobile;
    const modeParallaxMult = 0.45;
    const targetMouseX = allowParallax ? mousePos.current.x * modeParallaxMult : 0;
    const targetMouseY = allowParallax ? mousePos.current.y * modeParallaxMult : 0;

    const damp = 1 - Math.exp(-PARALLAX_CONFIG.DAMP_FACTOR * 60 * delta);
    smoothedMouse.current.x += (targetMouseX - smoothedMouse.current.x) * damp;
    smoothedMouse.current.y += (targetMouseY - smoothedMouse.current.y) * damp;

    const idleAmp = PARALLAX_CONFIG.IDLE_AMPLITUDE;
    const idleX = Math.sin(time * 0.35) * idleAmp;
    const idleY = Math.cos(time * 0.28) * (idleAmp * 0.75);
    const px = smoothedMouse.current.x * PARALLAX_CONFIG.MAX_POS_OFFSET + idleX;
    const py = -smoothedMouse.current.y * (PARALLAX_CONFIG.MAX_POS_OFFSET * 0.75) + idleY;

    // 3. Camera Position Lerp & LookAt (Zero allocations)
    const followSpeed = 1 - Math.exp(-8.0 * delta);

    persistentDesiredPos.current.copy(targetCamPos.current);
    persistentDesiredPos.current.x += px;
    persistentDesiredPos.current.y += py;
    camera.position.lerp(persistentDesiredPos.current, followSpeed);

    persistentLookOffset.current.copy(targetLookAt.current);
    persistentLookOffset.current.x += smoothedMouse.current.x * 0.2 + idleX * 0.15;
    persistentLookOffset.current.y += -smoothedMouse.current.y * 0.15 + idleY * 0.15;
    currentLookAt.current.lerp(persistentLookOffset.current, followSpeed);

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
