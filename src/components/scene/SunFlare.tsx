'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELESTIAL } from './celestialConstants';

// Shader for the Anamorphic Horizontal Streak (25–35% of canvas width)
const anamorphicVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const anamorphicFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;

  void main() {
    // Horizontal flare falloff: very wide on X, needle-thin on Y
    float x = abs(vUv.x * 2.0 - 1.0);
    float y = abs(vUv.y * 2.0 - 1.0);

    float streakX = exp(-x * 3.4);
    float streakY = exp(-y * y * 42.0);
    float intensity = streakX * streakY * uOpacity;

    // Electric cyan/blue anamorphic flare with incandescent white core
    vec3 cyanEdge = vec3(0.18, 0.68, 1.0);
    vec3 whiteCore = vec3(1.0, 1.0, 1.0);
    vec3 flareColor = mix(cyanEdge, whiteCore, pow(streakY, 4.0));

    gl_FragColor = vec4(flareColor * intensity * 1.8, intensity);
  }
`;

// Shader for Sun Core & Soft Corona Halo (~3x larger white core)
const coronaFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;

  void main() {
    float dist = length(vUv * 2.0 - 1.0);
    if (dist > 1.0) discard;

    // ~3x larger intense inner white core with soft solar corona
    float core = smoothstep(0.32, 0.0, dist);
    float corona = pow(1.0 - dist, 2.2);

    vec3 coreColor = vec3(1.0, 0.99, 0.94);
    vec3 coronaColor = vec3(0.24, 0.70, 1.0);

    vec3 color = mix(coronaColor, coreColor, core * 0.85 + 0.15);
    float alpha = (core * 0.95 + corona * 0.70) * uOpacity;

    gl_FragColor = vec4(color * 1.6, alpha);
  }
`;

// Shader for Faint Concentric Lens Ring
const ringFlareFragmentShader = `
  varying vec2 vUv;
  uniform float uOpacity;

  void main() {
    float dist = length(vUv * 2.0 - 1.0);
    // Delicate thin ring around dist ~ 0.50
    float ring = smoothstep(0.44, 0.50, dist) * (1.0 - smoothstep(0.50, 0.56, dist));
    float intensity = ring * uOpacity * 0.45;

    vec3 ringColor = vec3(0.25, 0.68, 1.0);
    gl_FragColor = vec4(ringColor * intensity * 1.4, intensity);
  }
`;

export function SunFlare() {
  const groupRef = useRef<THREE.Group>(null);
  const currentOpacity = useRef(1.0);
  const tempVec = useRef(new THREE.Vector3());

  const sunPos = useMemo(
    () => CELESTIAL.SUN_FLARE_DIR.clone().multiplyScalar(CELESTIAL.SUN_DISTANCE),
    []
  );

  const uniformsStreak = useMemo(
    () => ({
      uOpacity: { value: 1.0 },
    }),
    []
  );

  const uniformsCorona = useMemo(
    () => ({
      uOpacity: { value: 1.0 },
    }),
    []
  );

  const uniformsRing = useMemo(
    () => ({
      uOpacity: { value: 1.0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Billboard orientation: Always face camera
    groupRef.current.quaternion.copy(state.camera.quaternion);

    // 2. Frustum / Screen Edge Fade: Attenuate smoothly when leaving viewport
    tempVec.current.copy(sunPos).project(state.camera);
    const ndc = tempVec.current;

    let edgeFactor = 1.0;
    if (ndc.z > 1.0) {
      edgeFactor = 0.0; // Behind camera
    } else {
      const maxDist = Math.max(Math.abs(ndc.x), Math.abs(ndc.y));
      // Starts fading when approaching edge (0.95) and fully off by 1.35
      edgeFactor = 1.0 - THREE.MathUtils.smoothstep(maxDist, 0.95, 1.35);
    }

    // 3. Smooth Eclipse / Planet Occlusion Check
    const camPos = state.camera.position;
    const camToSun = sunPos.clone().sub(camPos).normalize();
    const camToOrigin = new THREE.Vector3().sub(camPos);
    const distToOrigin = camToOrigin.length();

    let occlusionFactor = 1.0;
    if (distToOrigin > CELESTIAL.PLANET_RADIUS) {
      const dirToOrigin = camToOrigin.clone().normalize();
      const dotVal = camToSun.dot(dirToOrigin);

      const sinAngularRadius = CELESTIAL.PLANET_RADIUS / distToOrigin;
      const cosAngularRadius = Math.sqrt(Math.max(0, 1.0 - sinAngularRadius * sinAngularRadius));

      if (dotVal > cosAngularRadius) {
        occlusionFactor = 0.0;
      } else {
        occlusionFactor = THREE.MathUtils.clamp((cosAngularRadius - dotVal) / 0.04, 0.0, 1.0);
      }
    }

    const targetOpacity = edgeFactor * occlusionFactor;
    currentOpacity.current += (targetOpacity - currentOpacity.current) * (1 - Math.exp(-6.0 * delta));

    uniformsStreak.uOpacity.value = currentOpacity.current;
    uniformsCorona.uOpacity.value = currentOpacity.current;
    uniformsRing.uOpacity.value = currentOpacity.current;
  });

  return (
    <group ref={groupRef} position={sunPos} renderOrder={10}>
      {/* 1. Anamorphic Horizontal Streak (25–35% of canvas width at distance 180 = ~88 units) */}
      <mesh scale={[88.0, 2.2, 1.0]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={anamorphicVertexShader}
          fragmentShader={anamorphicFragmentShader}
          uniforms={uniformsStreak}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. ~3x Larger Intense Core & Soft Sun Corona */}
      <mesh scale={[36.0, 36.0, 1.0]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={anamorphicVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={uniformsCorona}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Subtle Faint Concentric Lens Ring */}
      <mesh scale={[58.0, 58.0, 1.0]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={anamorphicVertexShader}
          fragmentShader={ringFlareFragmentShader}
          uniforms={uniformsRing}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
