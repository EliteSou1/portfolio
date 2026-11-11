'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELESTIAL } from './celestialConstants';
import { usePortfolio } from '@/context/PortfolioContext';

const moonVertexShader = `
  varying vec3 vModelPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vModelPos = position;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldP = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldP.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldP;
  }
`;

const moonFragmentShader = `
  uniform vec3 uSunDir;
  varying vec3 vModelPos;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
          mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
          mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  float fbm4(vec3 p) {
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      f += noise(p) * amp;
      p *= 2.05;
      amp *= 0.5;
    }
    return f;
  }

  void main() {
    vec3 norm = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 sunDir = normalize(uSunDir);

    // 1. Cratered & Maria Lunar Topography
    vec3 p = vModelPos * 3.5;
    float baseNoise = fbm4(p);
    float craterRidge = 1.0 - abs(noise(p * 2.8) * 2.0 - 1.0);
    float craters = pow(craterRidge, 3.2) * 0.28;

    // 2. Albedo: Icy bluish gray highlands & dark basaltic maria
    vec3 mariaColor = vec3(0.22, 0.25, 0.30);
    vec3 highlandColor = vec3(0.55, 0.62, 0.72);
    vec3 frostColor = vec3(0.80, 0.88, 0.96);

    vec3 albedo = mix(mariaColor, highlandColor, smoothstep(0.35, 0.65, baseNoise));
    albedo = mix(albedo, frostColor, craters);

    // 3. Phase Lighting (Driven strictly by SUN_LIGHT_DIR)
    float NdotL = dot(norm, sunDir);
    float dayFactor = smoothstep(-0.04, 0.22, NdotL);
    vec3 dayLit = albedo * max(NdotL, 0.0);

    // 4. Exoplanet-shine (Turquoise/Cyan bounce light from the giant world onto the moon)
    vec3 toPlanet = normalize(-vWorldPos);
    float planetBounce = max(dot(norm, toPlanet), 0.0);
    vec3 planetShine = vec3(0.04, 0.16, 0.24) * planetBounce * 0.65;

    // Deep space night ambient
    vec3 nightAmbient = albedo * vec3(0.008, 0.012, 0.02);

    vec3 finalColor = mix(nightAmbient + planetShine, dayLit, dayFactor);

    // 5. Very faint icy exosphere rim on the sunlit limb
    float rim = pow(1.0 - max(dot(viewDir, norm), 0.0), 3.5) * smoothstep(0.0, 0.35, NdotL);
    finalColor += vec3(0.20, 0.55, 0.85) * rim * 0.28;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  const { isReducedMotion } = usePortfolio();

  const uniforms = useMemo(
    () => ({
      uSunDir: { value: CELESTIAL.SUN_LIGHT_DIR },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!moonRef.current) return;

    // Slow orbital progression around the exoplanet (speed 0.045, initial phase 0.85)
    const time = state.clock.getElapsedTime();
    const speed = isReducedMotion ? 0.015 : CELESTIAL.MOON_ORBIT_SPEED;
    const angle = CELESTIAL.MOON_INITIAL_PHASE + time * speed;

    const r = CELESTIAL.MOON_ORBIT_RADIUS; // 8.8 (> RING_OUTER 7.1, never crosses rings)
    const inc = CELESTIAL.MOON_ORBIT_INCLINATION;

    // 3D Orbital Trajectory
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.sin(angle + 0.3) * (r * Math.sin(inc));

    moonRef.current.position.set(x, y, z);
    moonRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={moonRef} renderOrder={4}>
      <sphereGeometry args={[CELESTIAL.MOON_RADIUS, 32, 32]} />
      <shaderMaterial
        vertexShader={moonVertexShader}
        fragmentShader={moonFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
