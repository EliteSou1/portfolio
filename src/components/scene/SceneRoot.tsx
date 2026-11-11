import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ParticleField } from '@/components/scene/ParticleField';
import { ArchitectureGraph } from '@/components/scene/ArchitectureGraph';
import { sceneBridge, type SceneStatePayload } from '@/components/scene/sceneBridge';

// Curva tridimensional de recorrido de cámara a través de la galaxia
// Hero (vista panorámica elevada) -> Overview (descenso a los brazos) -> Case Studies (recorrido planeta a planeta) -> Contacto (núcleo estelar)
const FLIGHT_POINTS = [
  new THREE.Vector3(0, 15.5, 18.0),   // 0. Hero: Vista cósmica panorámica elevada
  new THREE.Vector3(3.2, 7.5, 11.5),   // 1. Descenso hacia el disco galáctico
  new THREE.Vector3(4.2, 3.6, 4.2),    // 2. Overview: Vuelo rasante entre los 4 brazos
  new THREE.Vector3(3.2, 1.4, -0.6),   // 3. Proyecto 1: Plaza Gran Vía Sur (Saturno)
  new THREE.Vector3(2.2, 1.0, -3.9),   // 4. Proyectos 2 y 3: Grupo SAOM & ERP Headless
  new THREE.Vector3(-2.8, 1.8, -4.8),  // 5. Proyectos 4 y 5: RedFeree & Sportk
  new THREE.Vector3(0.3, 0.9, 2.5),    // 6. Contacto: Aproximación final al núcleo incandescente
];

function CameraFlightController() {
  const [sceneState, setSceneState] = useState<SceneStatePayload>(sceneBridge.getCurrentState());

  const flightCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(FLIGHT_POINTS, false, 'centripetal');
  }, []);

  const currentCamPos = useRef(new THREE.Vector3(0, 15.5, 18.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    return sceneBridge.subscribe((state) => {
      setSceneState({ ...state });
    });
  }, []);

  useFrame((state, delta) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Accesibilidad: vista fija general sin recorrido de cámara
    if (reducedMotion) {
      state.camera.position.set(0, 14.5, 17.0);
      state.camera.lookAt(0, 0, 0);
      return;
    }

    const progress = Math.min(1, Math.max(0, sceneState.scrollProgress || 0));

    // Posición interpolada en la curva 3D
    const targetPos = flightCurve.getPointAt(progress);

    // Look-ahead en la curva: mirar ligeramente adelante para giro y banqueo natural
    const lookAheadProgress = Math.min(progress + 0.025, 1.0);
    const targetLookAt = flightCurve.getPointAt(lookAheadProgress);

    // En el tramo de contacto, mirar directo al centro exacto [0, 0, 0]
    if (progress > 0.9) {
      const coreRatio = (progress - 0.9) / 0.1;
      targetLookAt.lerp(new THREE.Vector3(0, 0, 0), coreRatio);
    }

    // Parallax de mouse sutil (±3°) superpuesto a la trayectoria
    const mouseX = (sceneBridge.mouse.targetX || 0) * 0.35;
    const mouseY = (sceneBridge.mouse.targetY || 0) * 0.25;

    currentCamPos.current.lerp(
      new THREE.Vector3(targetPos.x + mouseX, targetPos.y + mouseY, targetPos.z),
      delta * 2.8
    );
    currentLookAt.current.lerp(targetLookAt, delta * 2.8);

    state.camera.position.copy(currentCamPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}

export function SceneRoot() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 15.5, 18.0], fov: 52 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Niebla atmosférica profunda Warden */}
        <fogExp2 attach="fog" args={['#05070a', 0.038]} />
        <ambientLight intensity={0.5} />

        {/* Controlador de recorrido 3D en 3 ejes */}
        <CameraFlightController />

        {/* Galaxia espiral y planetas/constelaciones en sus brazos */}
        <group>
          <ParticleField />
          <ArchitectureGraph />
        </group>

        {/* Postprocessing sutil sin saturación neón artificial (la mezcla aditiva hace el brillo natural) */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.75}
            luminanceSmoothing={0.3}
            intensity={0.65}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

