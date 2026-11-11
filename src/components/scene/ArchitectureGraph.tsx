import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sceneBridge, type SceneStatePayload } from '@/components/scene/sceneBridge';

// 4 Constelaciones Celestes para SystemOverview ubicadas a lo largo de los 4 brazos
const CONSTELLATIONS_DATA = [
  {
    id: 'frontend-constellation',
    name: 'Constelación Brazo 0 (Frontend)',
    stars: [
      [2.2, 0.3, 0.8],
      [2.7, 0.5, 1.2],
      [3.1, 0.2, 0.6],
      [2.6, -0.1, 0.2],
    ] as [number, number, number][],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [0, 2]
    ],
  },
  {
    id: 'middleware-constellation',
    name: 'Constelación Brazo 1 (Middleware)',
    stars: [
      [-0.4, 0.4, 2.3],
      [-0.8, 0.2, 2.8],
      [-1.3, 0.5, 2.4],
      [-0.9, -0.1, 1.9],
    ] as [number, number, number][],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [1, 3]
    ],
  },
  {
    id: 'core-constellation',
    name: 'Constelación Brazo 2 (Núcleo Datos)',
    stars: [
      [-2.3, 0.3, -0.4],
      [-2.8, 0.5, -0.9],
      [-2.5, -0.1, -1.4],
      [-1.9, 0.2, -0.8],
    ] as [number, number, number][],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0]
    ],
  },
  {
    id: 'security-constellation',
    name: 'Constelación Brazo 3 (Perímetro Zero Trust)',
    stars: [
      [0.4, 0.4, -2.3],
      [0.8, 0.2, -2.8],
      [1.3, 0.5, -2.5],
      [0.9, -0.1, -1.9],
    ] as [number, number, number][],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [0, 2]
    ],
  },
];

// 5 Cuerpos Celestes / Planetas situados en las coordenadas reales de los brazos galácticos
interface PlanetConfig {
  slug: string;
  name: string;
  position: [number, number, number];
  radius: number;
  hasRings: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringTilt?: [number, number, number];
  hasMoon: boolean;
  moonDist?: number;
  moonSize?: number;
  moonSpeed?: number;
}

const CELESTIAL_PLANETS: PlanetConfig[] = [
  // 1. Plaza Gran Vía Sur: Brazo 1 (Integraciones / Middleware) en r = 3.6
  // Planeta majestuoso tipo Saturno con doble anillo y luna satélite
  {
    slug: 'plaza-gran-via-sur',
    name: 'Plaza Gran Vía Sur',
    position: [2.7, 0.25, -2.3],
    radius: 0.48,
    hasRings: true,
    ringInner: 0.65,
    ringOuter: 0.98,
    ringTilt: [Math.PI / 3.2, 0.25, -0.2],
    hasMoon: true,
    moonDist: 1.3,
    moonSize: 0.075,
    moonSpeed: 0.85,
  },
  // 2. Grupo SAOM CAS: Brazo 0 (Frontend / Telemetría) en r = 4.8
  // Planeta con satélite en órbita elíptica inclinada
  {
    slug: 'grupo-saom-cas',
    name: 'Grupo SAOM CAS',
    position: [3.5, -0.15, -3.3],
    radius: 0.42,
    hasRings: false,
    hasMoon: true,
    moonDist: 1.0,
    moonSize: 0.065,
    moonSpeed: 1.25,
  },
  // 3. Dashboard ERP Headless: Brazo 3 (Infraestructura / Perímetro) en r = 5.6
  // Planeta con anillo orbital fino y definido
  {
    slug: 'dashboard-erp-headless',
    name: 'Dashboard ERP Headless',
    position: [0.9, 0.3, -5.5],
    radius: 0.40,
    hasRings: true,
    ringInner: 0.54,
    ringOuter: 0.70,
    ringTilt: [Math.PI / 4, -0.2, 0.1],
    hasMoon: false,
  },
  // 4. RedFeree: Brazo 2 (Core / Base de Datos) en r = 6.8
  // Planeta compacto con satélite rápido
  {
    slug: 'redferee',
    name: 'RedFeree',
    position: [-0.3, -0.2, -6.8],
    radius: 0.35,
    hasRings: false,
    hasMoon: true,
    moonDist: 0.75,
    moonSize: 0.05,
    moonSpeed: 1.7,
  },
  // 5. Sportk: Brazo 0 (Perímetro Exterior) en r = 8.2
  // Planeta liso y limpio sin anillos ni satélites
  {
    slug: 'sportk',
    name: 'Sportk',
    position: [-8.0, 0.15, -1.3],
    radius: 0.32,
    hasRings: false,
    hasMoon: false,
  },
];

export function ArchitectureGraph() {
  const [sceneState, setSceneState] = useState<SceneStatePayload>(sceneBridge.getCurrentState());

  // Opacidades lerp para transiciones cinemáticas
  const planetsOpacity = useRef(0);
  const constellationsOpacity = useRef(0);
  const contactOpacity = useRef(0);

  // Referencias a grupos y lunas
  const planetsGroupRef = useRef<THREE.Group>(null);
  const constellationsGroupRef = useRef<THREE.Group>(null);
  const contactGroupRef = useRef<THREE.Group>(null);

  const moonRefs = useRef<Array<THREE.Mesh | null>>([null, null, null, null, null]);

  // Colores cósmicos
  const cyanColor = useMemo(() => new THREE.Color('#3fa9c9'), []);
  const cyanBright = useMemo(() => new THREE.Color('#6fd6e8'), []);
  const amberColor = useMemo(() => new THREE.Color('#b8874a'), []);

  useEffect(() => {
    return sceneBridge.subscribe((state) => {
      setSceneState({ ...state });
    });
  }, []);

  // Construcción de líneas de constelaciones
  const constellationLinePositions = useMemo(() => {
    const coords: number[] = [];

    CONSTELLATIONS_DATA.forEach((constellation) => {
      constellation.edges.forEach(([i, j]) => {
        const starA = constellation.stars[i];
        const starB = constellation.stars[j];
        if (starA && starB) {
          coords.push(...starA);
          coords.push(...starB);
        }
      });
    });

    return new Float32Array(coords);
  }, []);

  // Estrellas de las constelaciones
  const allConstellationStars = useMemo(() => {
    const stars: [number, number, number][] = [];
    CONSTELLATIONS_DATA.forEach((c) => stars.push(...c.stars));
    return stars;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const section = sceneState.section;

    // Targets de opacidad según la narrativa espacial:
    // HERO: Sólo estrellas dispersas (planetas y constelaciones en 0)
    // OVERVIEW: Constelaciones astrales activas
    // CASE_STUDY: Planetas con anillos y lunas activos
    // CONTACT: Foco cálido central ámbar
    const targetPlanets = section === 'CASE_STUDY' ? 1.0 : 0.0;
    const targetConstellations = section === 'OVERVIEW' ? 1.0 : 0.0;
    const targetContact = section === 'CONTACT' ? 1.0 : 0.0;

    planetsOpacity.current = THREE.MathUtils.lerp(planetsOpacity.current, targetPlanets, delta * 3.2);
    constellationsOpacity.current = THREE.MathUtils.lerp(constellationsOpacity.current, targetConstellations, delta * 3.2);
    contactOpacity.current = THREE.MathUtils.lerp(contactOpacity.current, targetContact, delta * 3.2);

    if (planetsGroupRef.current) {
      planetsGroupRef.current.visible = planetsOpacity.current > 0.01;
    }
    if (constellationsGroupRef.current) {
      constellationsGroupRef.current.visible = constellationsOpacity.current > 0.01;
    }
    if (contactGroupRef.current) {
      contactGroupRef.current.visible = contactOpacity.current > 0.01;
    }

    // Animación de órbitas de satélites/lunas
    CELESTIAL_PLANETS.forEach((planet, idx) => {
      const moonMesh = moonRefs.current[idx];
      if (planet.hasMoon && moonMesh && planet.moonDist && planet.moonSpeed) {
        const moonAngle = time * planet.moonSpeed + idx * 1.5;
        const mX = planet.position[0] + Math.cos(moonAngle) * planet.moonDist;
        const mY = planet.position[1] + Math.sin(moonAngle) * 0.45 * planet.moonDist;
        const mZ = planet.position[2] + Math.sin(moonAngle) * planet.moonDist;
        moonMesh.position.set(mX, mY, mZ);
      }
    });

    // Movimiento cósmico lento del conjunto
    if (planetsGroupRef.current) {
      planetsGroupRef.current.position.y = Math.sin(time * 0.25) * 0.03;
    }
  });

  return (
    <>
      {/* 1. SISTEMA DE PLANETAS (Casos de Estudio Reales del CV) */}
      <group ref={planetsGroupRef} visible={false}>
        {CELESTIAL_PLANETS.map((planet, idx) => {
          const isCurrentActive = sceneState.slug === planet.slug;
          const planetColor = isCurrentActive ? cyanBright : cyanColor;
          const baseOpacity = planetsOpacity.current * (isCurrentActive ? 0.95 : 0.65);

          return (
            <group key={planet.slug}>
              {/* Esfera Central del Planeta */}
              <mesh position={planet.position}>
                <sphereGeometry args={[planet.radius, 32, 32]} />
                <meshStandardMaterial
                  color={planetColor}
                  roughness={0.4}
                  metalness={0.7}
                  transparent
                  opacity={baseOpacity}
                  emissive={planetColor}
                  emissiveIntensity={isCurrentActive ? 0.65 : 0.25}
                />
              </mesh>

              {/* Halo / Atmósfera exterior con Bloom */}
              <mesh position={planet.position}>
                <sphereGeometry args={[planet.radius * 1.15, 24, 24]} />
                <meshBasicMaterial
                  color={planetColor}
                  transparent
                  opacity={baseOpacity * (isCurrentActive ? 0.35 : 0.15)}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                />
              </mesh>

              {/* Anillo Orbital (si la complejidad del proyecto lo contempla) */}
              {planet.hasRings && planet.ringInner && planet.ringOuter && (
                <mesh
                  position={planet.position}
                  rotation={planet.ringTilt || [Math.PI / 3, 0, 0]}
                >
                  <ringGeometry args={[planet.ringInner, planet.ringOuter, 48]} />
                  <meshBasicMaterial
                    color={planetColor}
                    transparent
                    opacity={baseOpacity * (isCurrentActive ? 0.6 : 0.35)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              )}

              {/* Luna Satélite en Órbita */}
              {planet.hasMoon && (
                <mesh
                  ref={(el) => {
                    moonRefs.current[idx] = el;
                  }}
                  position={planet.position}
                >
                  <sphereGeometry args={[planet.moonSize || 0.06, 16, 16]} />
                  <meshStandardMaterial
                    color={cyanBright}
                    emissive={cyanBright}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={baseOpacity}
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* 2. CONSTELACIONES ASTRALES (SystemOverview: 4 Clústeres Celestes) */}
      <group ref={constellationsGroupRef} visible={false}>
        {/* Líneas tenues entre estrellas de las constelaciones */}
        {constellationLinePositions.length > 0 && (
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[constellationLinePositions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color={cyanColor}
              transparent
              opacity={constellationsOpacity.current * 0.45}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
        )}

        {/* Nodos estelares clave de cada constelación */}
        {allConstellationStars.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial
              color={cyanBright}
              transparent
              opacity={constellationsOpacity.current * 0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 3. NÚCLEO CENTRAL ÁMBAR (Contacto: Punto de Convergencia) */}
      <group ref={contactGroupRef} visible={false}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial
            color={amberColor}
            emissive={amberColor}
            emissiveIntensity={1.2}
            transparent
            opacity={contactOpacity.current * 0.95}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshBasicMaterial
            color={amberColor}
            transparent
            opacity={contactOpacity.current * 0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </>
  );
}

