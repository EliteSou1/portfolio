import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRecommendedParticleCount } from '@/lib/webgl-support';
import { sceneBridge, type SceneStatePayload, type RippleItem } from '@/components/scene/sceneBridge';

interface ActiveRippleState {
  id: number;
  x: number;
  y: number;
  z: number;
  startTime: number;
  duration: number;
  intensity: number;
}

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = useMemo(() => getRecommendedParticleCount(), []);
  const [sceneState, setSceneState] = useState<SceneStatePayload>(sceneBridge.getCurrentState());

  // Parámetros de la Galaxia Espiral (Algoritmo Three.js Journey adaptado a paleta Warden)
  const galaxyParams = useMemo(
    () => ({
      radius: 13,
      branches: 4, // 4 Brazos temáticos: Frontend, Middleware, Core Datos, Perímetro Zero Trust
      spin: 1.15,
      randomness: 0.35,
      randomnessPower: 3.2, // Exponente alto = concentración densa en brazos con dispersión suave
      insideColor: new THREE.Color('#0a192f'), // Núcleo azul-negro profundo
      outsideColor: new THREE.Color('#6fd6e8'), // Bordes de brazo: cian luminoso
      coreStarColor: new THREE.Color('#f8fafc'), // Estrellas centrales incandescentes
    }),
    []
  );

  // Ripples activos ("Gota en el mar")
  const activeRipples = useRef<ActiveRippleState[]>([]);

  useEffect(() => {
    // 1. Suscripción al estado de escena
    const unsubscribeState = sceneBridge.subscribe((state) => {
      setSceneState({ ...state });
    });

    // 2. Suscripción al ripple de clic
    const unsubscribeRipple = sceneBridge.onRipple((ripple: RippleItem) => {
      activeRipples.current.push({
        id: ripple.id,
        x: ripple.x,
        y: ripple.y,
        z: ripple.z,
        startTime: Date.now() / 1000,
        duration: 1.8,
        intensity: ripple.intensity,
      });

      if (activeRipples.current.length > 8) {
        activeRipples.current.shift();
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeRipple();
    };
  }, []);

  // Generación ÚNICA y FIJA de la geometría de la Galaxia (se reserva una sola vez al montar)
  const { originalPositions, currentPositions, colors, particleBranches } = useMemo(() => {
    const origPos = new Float32Array(count * 3);
    const currPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const branches = new Uint8Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribución radial (concentración progresiva hacia el núcleo)
      const r = Math.pow(Math.random(), 1.25) * galaxyParams.radius;

      // 4 Brazos espirales
      const branchIndex = i % galaxyParams.branches;
      branches[i] = branchIndex;

      const branchAngle = (branchIndex / galaxyParams.branches) * Math.PI * 2;
      const spinAngle = r * galaxyParams.spin;

      // Dispersión exponencial orgánica
      const randomX =
        Math.pow(Math.random(), galaxyParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        galaxyParams.randomness *
        r;
      const randomY =
        Math.pow(Math.random(), galaxyParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        (galaxyParams.randomness * 0.42) *
        r; // Disco galáctico más delgado en eje vertical
      const randomZ =
        Math.pow(Math.random(), galaxyParams.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        galaxyParams.randomness *
        r;

      // Coordenadas en el plano galáctico (XZ con espesor en Y)
      const x = Math.cos(branchAngle + spinAngle) * r + randomX;
      const y = randomY;
      const z = Math.sin(branchAngle + spinAngle) * r + randomZ;

      origPos[i3] = x;
      origPos[i3 + 1] = y;
      origPos[i3 + 2] = z;

      currPos[i3] = x;
      currPos[i3 + 1] = y;
      currPos[i3 + 2] = z;

      // Degradado de color por partícula: núcleo profundo a brazos cian luminoso
      const radiusRatio = r / galaxyParams.radius;
      const mixedColor = galaxyParams.insideColor.clone().lerp(galaxyParams.outsideColor, radiusRatio);

      // Núcleo incandescente (estrellas superpuestas en el centro)
      if (r < 1.2) {
        const coreRatio = (1 - r / 1.2) * 0.75;
        mixedColor.lerp(galaxyParams.coreStarColor, coreRatio);
      }

      cols[i3] = mixedColor.r;
      cols[i3 + 1] = mixedColor.g;
      cols[i3 + 2] = mixedColor.b;
    }

    return {
      originalPositions: origPos,
      currentPositions: currPos,
      colors: cols,
      particleBranches: branches,
    };
  }, [count, galaxyParams]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;

    const now = Date.now() / 1000;
    const time = state.clock.getElapsedTime();

    // Rotación lenta intrínseca de la galaxia completa
    if (!reducedMotion) {
      pointsRef.current.rotation.y += delta * 0.025;
    }

    // Filtrar ripples expirados (> 1.8s)
    activeRipples.current = activeRipples.current.filter((r) => now - r.startTime < r.duration);
    const hasRipples = activeRipples.current.length > 0;

    const activeBranch = sceneState.activeBranchIndex;

    // Actualización de posiciones y colores con física de ripple y resaltado de brazo
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const branch = particleBranches[i];

      const origX = originalPositions[i3];
      const origY = originalPositions[i3 + 1];
      const origZ = originalPositions[i3 + 2];

      // Ondulación suave ambiental estelar
      const flutter = Math.sin(time * 0.4 + origX * 0.2) * 0.0015;

      // Lerp suave hacia posición base
      posArray[i3] += (origX - posArray[i3]) * (delta * 3.0);
      posArray[i3 + 1] += (origY - posArray[i3 + 1]) * (delta * 3.0) + flutter;
      posArray[i3 + 2] += (origZ - posArray[i3 + 2]) * (delta * 3.0);

      // Resaltado del brazo activo (cuando el usuario interactúa con una capa en SystemOverview)
      if (activeBranch !== null && activeBranch !== undefined && branch === activeBranch) {
        // Ligero destello cian sobre el brazo correspondiente
        colArray[i3] = Math.min(1, colors[i3] + 0.25);
        colArray[i3 + 1] = Math.min(1, colors[i3 + 1] + 0.35);
        colArray[i3 + 2] = Math.min(1, colors[i3 + 2] + 0.35);
      } else {
        // Restauración suave del color base
        colArray[i3] = colors[i3];
        colArray[i3 + 1] = colors[i3 + 1];
        colArray[i3 + 2] = colors[i3 + 2];
      }

      // Física de Ripple ("Gota en el mar") sobre la galaxia
      if (hasRipples) {
        for (let r = 0; r < activeRipples.current.length; r++) {
          const rip = activeRipples.current[r];
          const elapsed = now - rip.startTime;
          const progress = Math.min(1, Math.max(0, elapsed / rip.duration));

          // Decaimiento cúbico power3.out = (1 - progress)^3
          const decay = Math.pow(1 - progress, 3);
          const currentWaveRadius = progress * 6.5;

          const dx = posArray[i3] - rip.x;
          const dz = posArray[i3 + 2] - rip.z;
          const dist = Math.sqrt(dx * dx + dz * dz) + 0.0001;

          const distFromWave = Math.abs(dist - currentWaveRadius);
          const waveThickness = 1.4;

          if (distFromWave < waveThickness) {
            const waveFactor = (1 - distFromWave / waveThickness) * decay * rip.intensity;

            // Enriquecer brillo en el paso de la onda
            colArray[i3] = Math.min(1, colArray[i3] + waveFactor * 0.6);
            colArray[i3 + 1] = Math.min(1, colArray[i3 + 1] + waveFactor * 0.8);
            colArray[i3 + 2] = Math.min(1, colArray[i3 + 2] + waveFactor * 0.8);

            // Desplazamiento radial (sólo si no hay reduced motion)
            if (!reducedMotion) {
              const push = waveFactor * 0.35;
              posArray[i3] += (dx / dist) * push;
              posArray[i3 + 1] += Math.sin(progress * Math.PI) * waveFactor * 0.22;
              posArray[i3 + 2] += (dz / dist) * push;
            }
          }
        }
      }
    }

    posAttr.needsUpdate = true;
    if (activeBranch !== null || hasRipples) {
      colAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.024}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
        transparent={true}
        opacity={0.88}
      />
    </points>
  );
}


