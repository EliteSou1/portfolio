'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_DYNAMICS } from '@/lib/spaceConfig';

const supernovaVertexShader = `
  uniform float uTime;
  uniform float uBirth;
  uniform float uDuration;
  uniform vec3 uCenter;

  varying vec2 vUv;
  varying float vProgress;

  void main() {
    vUv = uv;

    float age = uTime - uBirth;
    float p = age / uDuration;
    vProgress = p;

    // Keep culled / collapsed if dormant
    if (age < 0.0 || p > 1.0) {
      gl_Position = vec4(0.0, 0.0, -9999.0, 1.0);
      return;
    }

    // Expanding bounding envelope
    float currentRadius = 10.0 + p * 34.0;

    // View-aligned camera billboard
    vec4 mvCenter = modelViewMatrix * vec4(uCenter, 1.0);
    vec4 mvPosition = mvCenter + vec4((uv - vec2(0.5)) * currentRadius * 2.0, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const supernovaFragmentShader = `
  uniform float uTime;
  uniform float uBirth;
  uniform float uDuration;
  uniform float uFlashDuration;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying float vProgress;

  void main() {
    if (vProgress < 0.0 || vProgress > 1.0) discard;

    vec2 centered = (vUv - vec2(0.5)) * 2.0;
    float dist = length(centered);
    if (dist > 1.0) discard;

    float age = uTime - uBirth;

    // Phase 1: Sudden Stellar Ignition Flash (0.25 s)
    float flashProgress = age / uFlashDuration;
    float flashIntensity = 0.0;
    if (flashProgress >= 0.0 && flashProgress <= 1.0) {
      float coreDecay = exp(-flashProgress * 7.5);
      // 4-point subtle diffraction flare spike
      float spike = exp(-abs(centered.x) * 30.0) * exp(-abs(centered.y) * 4.0)
                  + exp(-abs(centered.y) * 30.0) * exp(-abs(centered.x) * 4.0);
      flashIntensity = (pow(max(0.0, 1.0 - dist), 4.0) * 4.5 + spike * 1.8) * coreDecay;
    }

    // Phase 2: Expanding Relativistic Shockwave Ring (2.5 s)
    float ringRadius = vProgress * 0.88;
    float ringThickness = 0.05 + vProgress * 0.07;
    float ringDiff = abs(dist - ringRadius);
    float ringAlpha = exp(-pow(ringDiff / ringThickness, 2.0)) * pow(1.0 - vProgress, 1.5) * 1.7;

    // Subtle expanding nebular remnant cloud
    float innerCloud = pow(max(0.0, 1.0 - dist / max(0.08, ringRadius)), 2.5) * pow(1.0 - vProgress, 2.2) * 0.4;

    float totalAlpha = flashIntensity + ringAlpha + innerCloud;
    if (totalAlpha < 0.004) discard;

    // Supernova color grading: incandescent core white transitioning to spectral azure/gold
    vec3 col = mix(uColor, vec3(1.0, 1.0, 1.0), min(1.0, flashIntensity * 0.75));

    gl_FragColor = vec4(col * (1.0 + flashIntensity * 2.2), min(1.0, totalAlpha));
  }
`;

export function Supernova() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const nextTriggerTime = useRef(THREE.MathUtils.randFloat(10.0, 20.0));
  const camDir = useRef(new THREE.Vector3());
  const camRight = useRef(new THREE.Vector3());
  const camUp = useRef(new THREE.Vector3());
  const eventPos = useRef(new THREE.Vector3(0, 0, -200));

  const palette = useMemo(
    () => [
      new THREE.Color('#38bdf8'), // Azure Blue
      new THREE.Color('#c084fc'), // Pulsar Violet
      new THREE.Color('#fbbf24'), // Golden Supergiant
      new THREE.Color('#f43f5e'), // Crimson Nova
    ],
    []
  );

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: supernovaVertexShader,
      fragmentShader: supernovaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBirth: { value: -999.0 },
        uDuration: { value: SPACE_DYNAMICS.supernovaRingDuration },
        uFlashDuration: { value: SPACE_DYNAMICS.supernovaFlashDuration },
        uCenter: { value: new THREE.Vector3(0, 0, -200) },
        uColor: { value: new THREE.Color('#38bdf8') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    // Check if it's time to trigger a new supernova detonation
    if (t >= nextTriggerTime.current) {
      camera.getWorldDirection(camDir.current);
      camRight.current.crossVectors(camDir.current, camera.up).normalize();
      camUp.current.crossVectors(camRight.current, camDir.current).normalize();

      // Place event in visible sky field at distance ~190
      const dist = SPACE_DYNAMICS.supernovaDistance;
      const angleH = THREE.MathUtils.randFloatSpread(1.2);
      const angleV = THREE.MathUtils.randFloat(-0.4, 0.6);

      eventPos.current
        .copy(camera.position)
        .addScaledVector(camDir.current, dist * Math.cos(angleH) * Math.cos(angleV))
        .addScaledVector(camRight.current, dist * Math.sin(angleH))
        .addScaledVector(camUp.current, dist * Math.sin(angleV));

      material.uniforms.uBirth.value = t;
      material.uniforms.uCenter.value.copy(eventPos.current);

      // Random palette selection
      const col = palette[Math.floor(Math.random() * palette.length)];
      material.uniforms.uColor.value.copy(col);

      // Schedule next event (every 20 to 40 seconds)
      nextTriggerTime.current =
        t +
        THREE.MathUtils.randFloat(
          SPACE_DYNAMICS.supernovaIntervalMin,
          SPACE_DYNAMICS.supernovaIntervalMax
        );
    }
  });

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
