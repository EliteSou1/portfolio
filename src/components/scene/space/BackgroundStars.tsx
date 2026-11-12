'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS } from '@/lib/spaceConfig';
import { spaceStore } from './spaceStore';
import { getParticleCircleTexture } from '@/lib/particle-texture';

const starsVertexShader = `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  attribute float aTwinkleSpeed;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Organic subtle stellar scintillation: calm, steady starlight
    float twinkle = 0.85 + 0.15 * sin(uTime * (aTwinkleSpeed * 0.5) + aPhase);
    vAlpha = twinkle * 0.75;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (aSize * 0.8) * (200.0 / -mvPosition.z) * twinkle;
  }
`;

const starsFragmentShader = `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float a = tex.a * vAlpha;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vColor, a);

    #include <colorspace_fragment>
  }
`;

const heroQuadVertexShader = `
  uniform vec3 uPosition;
  uniform float uScale;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 mvCenter = modelViewMatrix * vec4(uPosition, 1.0);
    vec4 mvPos = mvCenter + vec4((uv - vec2(0.5)) * uScale, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const heroQuadFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - vec2(0.5)) * 2.0;
    float dist = length(p);

    // 4-point soft diffraction spike
    float spikeH = exp(-abs(p.y) * 28.0) * exp(-abs(p.x) * 2.5);
    float spikeV = exp(-abs(p.x) * 28.0) * exp(-abs(p.y) * 2.5);
    float core = exp(-dist * 6.5) * 1.5;

    float pulse = 0.85 + 0.15 * sin(uTime * 1.4 + uPhase);
    float total = (spikeH + spikeV + core) * pulse;

    if (total < 0.005) discard;
    gl_FragColor = vec4(uColor * (1.0 + core * 2.0), min(1.0, total * 0.9));

    #include <colorspace_fragment>
  }
`;

interface BackgroundStarsProps {
  isMobile?: boolean;
}

export function BackgroundStars({ isMobile = false }: BackgroundStarsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => getParticleCircleTexture(), []);

  const totalCount = isMobile
    ? SPACE_BUDGETS.mobile.backgroundStars
    : SPACE_BUDGETS.desktop.backgroundStars;

  // 1. Realistic Astronomical Stellar Temperature Palette (Converted to Linear)
  const [starGeometry, starMaterial, heroStars] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(totalCount * 3);
    const col = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const phases = new Float32Array(totalCount);
    const speeds = new Float32Array(totalCount);

    const spectralPalette = [
      new THREE.Color('#b0c8ff').convertSRGBToLinear(), // B Type: Subtle Blue-White (not cyan)
      new THREE.Color('#c8d8ff').convertSRGBToLinear(), // Late B Type
      new THREE.Color('#ffffff').convertSRGBToLinear(), // A Type: Pure Crisp White (Dominant ~50%)
      new THREE.Color('#f4f6fa').convertSRGBToLinear(), // F Type: Neutral Off-White
      new THREE.Color('#fff0d6').convertSRGBToLinear(), // G Type: Solar Warm Cream
      new THREE.Color('#ffbe76').convertSRGBToLinear(), // K Type: Golden Amber
      new THREE.Color('#ff6347').convertSRGBToLinear(), // M Type: Crimson Red Giant (~3%)
    ];

    const heroes: { position: THREE.Vector3; color: THREE.Color; scale: number; phase: number }[] = [];

    // Distribute uniformly across distant celestial vault shell (R ~ 270-330)
    for (let i = 0; i < totalCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      const r = 270.0 + Math.random() * 60.0;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Realistic stellar distribution: mostly crisp whites, followed by blues, solar creams, ambers, rare red
      const p = Math.random();
      let colorSample: THREE.Color;
      if (p < 0.12) {
        colorSample = spectralPalette[0]; // Blue-white
      } else if (p < 0.22) {
        colorSample = spectralPalette[1];
      } else if (p < 0.70) {
        colorSample = spectralPalette[2]; // White
      } else if (p < 0.85) {
        colorSample = spectralPalette[4]; // Solar Cream
      } else if (p < 0.96) {
        colorSample = spectralPalette[5]; // Golden Amber
      } else {
        colorSample = spectralPalette[6]; // Red Giant
      }

      // High contrast: Lower average brightness, with rare piercing beacons
      // Most stars are faint pinpoints (~0.15 - 0.45), few piercing stars (~1.2)
      const lum = 0.12 + Math.pow(Math.random(), 3.5) * 1.35;
      col[i * 3] = colorSample.r * lum;
      col[i * 3 + 1] = colorSample.g * lum;
      col[i * 3 + 2] = colorSample.b * lum;

      sizes[i] = 0.05 + Math.random() * 0.07;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.8 + Math.random() * 2.5;

      // Exactly 4 Hero Stars with subtle diffraction cross
      if (heroes.length < 4 && i % Math.floor(totalCount / 4) === 12) {
        sizes[i] = 0.16;
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 1.0;
        heroes.push({
          position: new THREE.Vector3(x, y, z),
          color: colorSample.clone(),
          scale: 4.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: starsVertexShader,
      fragmentShader: starsFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat, heroes];
  }, [totalCount, circleTexture]);

  // Shader materials for the 4 hero diffraction crosses
  const heroMaterials = useMemo(() => {
    return heroStars.map((hero) => {
      return new THREE.ShaderMaterial({
        vertexShader: heroQuadVertexShader,
        fragmentShader: heroQuadFragmentShader,
        uniforms: {
          uPosition: { value: hero.position },
          uScale: { value: hero.scale },
          uColor: { value: hero.color },
          uTime: { value: 0 },
          uPhase: { value: hero.phase },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
    });
  }, [heroStars]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    starMaterial.uniforms.uTime.value = t;

    for (let i = 0; i < heroMaterials.length; i++) {
      heroMaterials[i].uniforms.uTime.value = t;
    }

    // Adaptive quality draw range
    const quality = spaceStore.getState().qualityLevel;
    const ratio = quality === 'low' ? 0.4 : quality === 'medium' ? 0.65 : 1.0;
    starGeometry.setDrawRange(0, Math.floor(totalCount * ratio));
  });

  return (
    <group>
      {/* 4,000 Realistic Spectral Stars (High contrast, authentic color temperatures) */}
      <points ref={pointsRef} geometry={starGeometry} material={starMaterial} />

      {/* 4 Hero Stars with Soft Diffraction Crosses */}
      {heroStars.map((hero, idx) => (
        <mesh key={idx} material={heroMaterials[idx]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
