'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CELESTIAL } from './celestialConstants';

const ringVertexShader = `
  varying vec3 vRingWorldPos;
  varying vec3 vRingWorldNormal;
  varying float vRadius;

  void main() {
    vRadius = length(position.xy);
    vRingWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldP = modelMatrix * vec4(position, 1.0);
    vRingWorldPos = worldP.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldP;
  }
`;

const ringFragmentShader = `
  uniform vec3 uSunDir;
  uniform vec3 uPlanetCenter;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uPlanetRadius;

  varying vec3 vRingWorldPos;
  varying vec3 vRingWorldNormal;
  varying float vRadius;

  // Simple procedural noise for ring dust bands
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise1d(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
  }

  void main() {
    float u = clamp((vRadius - uInnerRadius) / (uOuterRadius - uInnerRadius), 0.0, 1.0);

    // 1. Concentric Ring Strata with Multi-frequency Dust Noise
    float fine1 = noise1d(u * 140.0);
    float fine2 = noise1d(u * 45.0);
    float bandWave = sin(u * 95.0) * 0.5 + 0.5;
    float dustDensity = fine1 * 0.45 + fine2 * 0.35 + bandWave * 0.20;

    // 2. Sharp Cassini & Encke Divisions (Clean Gaps)
    // Major Cassini Division (u ~ 0.58 to 0.63)
    float cassiniMajor = smoothstep(0.575, 0.585, u) * (1.0 - smoothstep(0.625, 0.635, u));
    // Minor Encke Division (u ~ 0.24 to 0.255)
    float cassiniMinor = smoothstep(0.238, 0.244, u) * (1.0 - smoothstep(0.252, 0.258, u));
    float gapMask = (1.0 - cassiniMajor * 0.98) * (1.0 - cassiniMinor * 0.92);

    // 3. Ice & Dust Color Palette (Icy blue-white, beige-rose, soft lilac-gray)
    vec3 iceWhite = vec3(0.82, 0.90, 0.98);
    vec3 beigeRose = vec3(0.88, 0.78, 0.72);
    vec3 lilacGray = vec3(0.70, 0.66, 0.78);

    vec3 ringColor = mix(iceWhite, beigeRose, smoothstep(0.15, 0.55, u + fine2 * 0.15));
    ringColor = mix(ringColor, lilacGray, smoothstep(0.65, 0.95, u));

    // 4. Edge Falloff & High Density Alpha (alpha >= 0.90 in dense bands to occlude background stars)
    float edgeInner = smoothstep(0.0, 0.035, u);
    float edgeOuter = 1.0 - smoothstep(0.95, 1.0, u);
    float baseAlpha = (0.78 + 0.22 * dustDensity) * gapMask * edgeInner * edgeOuter;

    // 5. Exoplanet Shadow on the Rings: Ray ring->sun in world space
    // Produces a smooth, curved elliptical silhouette with broad penumbra
    vec3 oc = vRingWorldPos - uPlanetCenter;
    float tc = -dot(oc, uSunDir); // > 0: el planeta queda hacia el sol
    float dist = length(oc + uSunDir * tc); // distancia mínima del rayo al centro
    float gate = smoothstep(0.0, uPlanetRadius * 0.6, tc);
    float shadow = gate * (1.0 - smoothstep(uPlanetRadius * 0.85, uPlanetRadius * 1.25, dist));

    // Shadow Floor & Planetshine: never drops to pitch black (~0.14 brightness with cool planet reflection)
    vec3 shadowed = ringColor * vec3(0.10, 0.13, 0.22);
    vec3 col = mix(ringColor, shadowed, shadow);

    // Light modulation: brighter on sunlit forward/backward scattering
    vec3 norm = normalize(vRingWorldNormal);
    float sunFacing = abs(dot(norm, uSunDir));
    vec3 litColor = col * (0.65 + 0.55 * sunFacing);
    float finalAlpha = baseAlpha * mix(1.0, 0.92, shadow);

    gl_FragColor = vec4(litColor, finalAlpha);
  }
`;

export function PlanetRings() {
  const uniforms = useMemo(
    () => ({
      uSunDir: { value: CELESTIAL.SUN_LIGHT_DIR },
      uPlanetCenter: { value: new THREE.Vector3(0, 0, 0) },
      uInnerRadius: { value: CELESTIAL.RING_INNER },
      uOuterRadius: { value: CELESTIAL.RING_OUTER },
      uPlanetRadius: { value: CELESTIAL.PLANET_RADIUS },
    }),
    []
  );

  return (
    // Ring tilted by ~24° relative to orbital plane; renderOrder={2} guarantees rendering in front of background stars
    <mesh
      renderOrder={2}
      rotation={[Math.PI / 2 + CELESTIAL.RING_TILT_X, 0, 0]}
    >
      <ringGeometry args={[CELESTIAL.RING_INNER, CELESTIAL.RING_OUTER, 128, 1]} />
      <shaderMaterial
        vertexShader={ringVertexShader}
        fragmentShader={ringFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
