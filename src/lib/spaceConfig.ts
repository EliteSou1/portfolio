import * as THREE from 'three';

/**
 * SPACE EXPLORATION & DEEP SPACE MASTER CONFIGURATION
 * Central repository for coordinates, counts, palettes, velocities, and flight curves.
 */

export type QualityLevel = 'high' | 'medium' | 'low';

export interface SpaceZoneConfig {
  id: string;
  name: string;
  position: THREE.Vector3;
  targetLookAt: THREE.Vector3;
  cullDistance: number;
}

// 1. ZONES & COORDINATES
export const SPACE_ZONES = {
  hero: {
    id: 'hero',
    name: 'Galaxia Central (Hero)',
    cameraPosition: new THREE.Vector3(1.8, 6.5, 9.2), // ~35° elevation, framed to right (leaving left open for text)
    targetLookAt: new THREE.Vector3(0.3, 0, 0),
    cullDistance: 60,
  },
  nebulaA: {
    id: 'nebulaA',
    name: 'Nebulosa Magenta-Violeta (A)',
    position: new THREE.Vector3(-18, 4, -30),
    cameraPosition: new THREE.Vector3(-18, 4, -30),
    targetLookAt: new THREE.Vector3(-22, 5, -45),
    cullDistance: 55,
    palette: {
      primary: '#ec4899',   // Magenta
      secondary: '#8b5cf6', // Violet
      darkDust: '#040208',  // Dense absorption silhouette
    },
  },
  nebulaB: {
    id: 'nebulaB',
    name: 'Nebulosa Turquesa-Azul (B)',
    position: new THREE.Vector3(22, -6, -55),
    cameraPosition: new THREE.Vector3(22, -6, -55),
    targetLookAt: new THREE.Vector3(26, -5, -70),
    cullDistance: 60,
    palette: {
      primary: '#22d3ee',   // Turquoise
      secondary: '#3b82f6', // Azure Blue
      darkDust: '#01050a',  // Dark interstellar dust
    },
  },
  asteroids: {
    id: 'asteroids',
    name: 'Cinturón de Asteroides',
    position: new THREE.Vector3(18, -4, -86),
    cameraPosition: new THREE.Vector3(-4, 6, -76),
    targetLookAt: new THREE.Vector3(14, -2, -92),
    cullDistance: 75,
    beltRadiusInner: 16,
    beltRadiusOuter: 36,
    beltHeight: 7.5,
  },
  nebulaC: {
    id: 'nebulaC',
    name: 'Nebulosa Dorado-Ámbar (C)',
    position: new THREE.Vector3(-10, 8, -110),
    cameraPosition: new THREE.Vector3(-10, 8, -110),
    targetLookAt: new THREE.Vector3(-14, 9, -125),
    cullDistance: 65,
    palette: {
      primary: '#ffcf8a',   // Gold
      secondary: '#f97316', // Amber-Orange
      darkDust: '#090501',  // Dark carbon silhouette
    },
  },
  blackHole: {
    id: 'blackHole',
    name: 'Zona Reservada: Singularidad Agujero Negro',
    position: new THREE.Vector3(0, 0, -150),
    cameraPosition: new THREE.Vector3(0, 0, -150),
    targetLookAt: new THREE.Vector3(0, 0, -180),
    cullDistance: 80,
  },
} as const;

// 2. JOURNEY PATH CATMULL-ROM CURVE
// Seamless camera voyage traversing all deep space landmarks
export const JOURNEY_POINTS = [
  SPACE_ZONES.hero.cameraPosition.clone(),
  SPACE_ZONES.nebulaA.cameraPosition.clone(),
  SPACE_ZONES.nebulaB.cameraPosition.clone(),
  SPACE_ZONES.asteroids.cameraPosition.clone(),
  SPACE_ZONES.nebulaC.cameraPosition.clone(),
  SPACE_ZONES.blackHole.cameraPosition.clone(),
];

export const JOURNEY_PATH = new THREE.CatmullRomCurve3(
  JOURNEY_POINTS,
  false, // closed
  'catmullrom',
  0.5
);

export const LOOK_TARGETS_POINTS = [
  SPACE_ZONES.hero.targetLookAt.clone(),
  SPACE_ZONES.nebulaA.targetLookAt.clone(),
  SPACE_ZONES.nebulaB.targetLookAt.clone(),
  SPACE_ZONES.asteroids.targetLookAt.clone(),
  SPACE_ZONES.nebulaC.targetLookAt.clone(),
  SPACE_ZONES.blackHole.targetLookAt.clone(),
];

export const LOOK_PATH = new THREE.CatmullRomCurve3(
  LOOK_TARGETS_POINTS,
  false,
  'catmullrom',
  0.5
);

// 3. BUDGETS & COUNTS
export const SPACE_BUDGETS = {
  desktop: {
    galaxy: 160000,
    backgroundStars: 4000,
    cosmicDust: 1500,
    asteroidDust: 2000,
    nebulaYoungStars: 300, // per nebula zone
    asteroidsTotal: 500,   // distributed across 3 meshes: 170, 170, 160
    cometTail: 400,
    shootingStarPool: 8,
    supernovaPool: 1,
    activeNebulas: 3,
  },
  mobile: {
    galaxy: 60000,
    backgroundStars: 2000,
    cosmicDust: 750,
    asteroidDust: 1000,
    nebulaYoungStars: 150,
    asteroidsTotal: 250,   // 85, 85, 80
    cometTail: 0,          // disabled on mobile
    shootingStarPool: 4,
    supernovaPool: 1,
    activeNebulas: 2,      // Nebula A and B only
  },
} as const;

// 4. TIMINGS & DYNAMICS
export const SPACE_DYNAMICS = {
  // Cosmic dust
  dustBoxSize: 32.0,
  dustDriftSpeed: 0.15,
  dustRepulsionRadius: 6.0,
  dustRepulsionForce: 1.6,

  // Shooting stars
  shootingStarIntervalMin: 3.0,
  shootingStarIntervalMax: 9.0,
  shootingStarDuration: 1.2,
  shootingStarDistance: 70.0,
  shootingStarSpeed: 45.0,

  // Comet
  cometOrbitDuration: 75.0, // seconds for full deep loop (60-90s)
  cometPathStart: new THREE.Vector3(75, 25, -160),
  cometPathEnd: new THREE.Vector3(-65, -15, 20),

  // Supernova
  supernovaIntervalMin: 20.0,
  supernovaIntervalMax: 40.0,
  supernovaFlashDuration: 0.25,
  supernovaRingDuration: 2.5,
  supernovaDistance: 190.0,

  // Asteroid belt
  beltRotationSpeed: 0.012, // rad/s
  asteroidTumbleSpeedMin: 0.1,
  asteroidTumbleSpeedMax: 0.7,
} as const;

// 5. ADAPTIVE QUALITY PRESETS
export const QUALITY_CONFIGS = {
  high: {
    drawRatioGalaxy: 1.0,
    drawRatioDust: 1.0,
    drawRatioAsteroidBelt: 1.0,
    nebulaLayerCount: 4,
    enableMousePush: true,
    dpr: 1.5,
  },
  medium: {
    drawRatioGalaxy: 0.65,
    drawRatioDust: 0.65,
    drawRatioAsteroidBelt: 0.65,
    nebulaLayerCount: 3,
    enableMousePush: true,
    dpr: 1.25,
  },
  low: {
    drawRatioGalaxy: 0.35,
    drawRatioDust: 0.40,
    drawRatioAsteroidBelt: 0.40,
    nebulaLayerCount: 2,
    enableMousePush: false,
    dpr: 1.0,
  },
} as const;
