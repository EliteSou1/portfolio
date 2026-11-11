import * as THREE from 'three';

// Planetary and Ring geometry tilt parameters
const PLANET_TILT_Z = 0.41; // ~23.5° axial tilt
const PLANET_TILT_X = 0.08;
const RING_TILT_X = 0.42; // ~24° relative inclination

// Calculate ring plane normal in world space via composite quaternions
const ringEuler = new THREE.Euler(Math.PI / 2 + RING_TILT_X, 0, 0, 'XYZ');
const planetEuler = new THREE.Euler(PLANET_TILT_X, 0, PLANET_TILT_Z, 'XYZ');
const qRing = new THREE.Quaternion().setFromEuler(ringEuler);
const qPlanet = new THREE.Quaternion().setFromEuler(planetEuler);
const qTotal = qPlanet.multiply(qRing);
export const RING_NORMAL = new THREE.Vector3(0, 0, 1).applyQuaternion(qTotal).normalize();

// Visual direction of the Sun Flare (up and to the right in the sky)
export const SUN_FLARE_DIR = new THREE.Vector3(1.22, 0.68, 0.62).normalize();

// Direction towards camera from planet center (default camera at [0, 0, -11.5])
const DIR_TOWARDS_CAMERA = new THREE.Vector3(0, 0, -1);

// Lighting direction used by planet, rings, moon, and atmosphere:
// Elevated 17.9° above the ring plane, illuminating 46.1% of the visible disc (clear terminator)
export const SUN_LIGHT_DIR = SUN_FLARE_DIR.clone()
  .addScaledVector(DIR_TOWARDS_CAMERA, 0.45)
  .addScaledVector(RING_NORMAL, -0.25)
  .normalize();

export const CELESTIAL = {
  // Lighting & Sun vectors
  SUN_FLARE_DIR,
  SUN_LIGHT_DIR,
  RING_NORMAL,
  SUN_COLOR: new THREE.Color('#fffbf0'),
  SUN_DISTANCE: 180,

  // Central Exoplanet Dimensions & Axis
  PLANET_RADIUS: 3.2,
  PLANET_TILT_Z,
  PLANET_TILT_X,

  // Planetary Ring Geometry
  RING_INNER: 4.4, // ~1.38x planet radius
  RING_OUTER: 7.1, // ~2.22x planet radius
  RING_TILT_X,

  // Companion Moon (orbit strictly outside rings)
  MOON_RADIUS: 0.72,
  MOON_ORBIT_RADIUS: 8.8, // > RING_OUTER (7.1), never intersects rings
  MOON_ORBIT_SPEED: 0.045, // slow majestic orbital cycle
  MOON_ORBIT_INCLINATION: 0.28,
  MOON_INITIAL_PHASE: 0.85, // visible in frame on initial page load

  // Camera Orbit
  ORBIT_RADIUS: 11.5,
  INSPECT_ORBIT_RADIUS: 9.0,
} as const;
