'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS } from '@/lib/spaceConfig';
import { spaceStore } from './spaceStore';
import { getParticleCircleTexture, getGalaxyCoreHaloTexture } from '@/lib/particle-texture';

interface GalaxyProps {
  isMobile?: boolean;
}

// 1. MAIN STELLAR POPULATION SHADERS (Differential Rotation + Color Space Conversion)
const galaxyMainVertexShader = `
  uniform float uTime;
  attribute float aRadius;
  attribute float aRandom;
  attribute float aBrightness;

  varying float vRadius;
  varying float vRandom;
  varying float vBrightness;

  void main() {
    vRadius = aRadius;
    vRandom = aRandom;
    vBrightness = aBrightness;

    // Differential astronomical rotation: Core rotates faster than spiral arms
    float r = length(position.xz);
    float angVel = 0.040 / (0.65 + r * 0.65);
    float angle = uTime * angVel;

    float c = cos(angle);
    float s = sin(angle);
    vec3 rotatedPos = vec3(
      position.x * c - position.z * s,
      position.y,
      position.x * s + position.z * c
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Core stars are brighter & slightly larger, arms are fine luminous pinpoints
    float coreFactor = smoothstep(2.0, 0.0, r);
    float pSize = mix(0.024, 0.042, coreFactor);
    gl_PointSize = max(1.5, pSize * (220.0 / -mvPosition.z));
  }
`;

const galaxyMainFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uColorCore;   // #ffcf8a in linear space
  uniform vec3 uColorMid;    // #ec4899 in linear space
  uniform vec3 uColorOuter;  // #8b5cf6 in linear space
  uniform vec3 uColorAccent; // #38bdf8 in linear space

  varying float vRadius;
  varying float vRandom;
  varying float vBrightness;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.05) discard;

    // Smoothstep transition along normalized radius with organic individual star variation
    float rMod = clamp(vRadius + (vRandom - 0.5) * 0.16, 0.0, 1.0);
    vec3 col;
    if (rMod < 0.28) {
      float t = smoothstep(0.0, 0.28, rMod);
      col = mix(uColorCore, uColorMid, t);
    } else if (rMod < 0.72) {
      float t = smoothstep(0.28, 0.72, rMod);
      col = mix(uColorMid, uColorOuter, t);
    } else {
      float t = smoothstep(0.72, 1.0, rMod);
      col = mix(uColorOuter, uColorAccent, t * 0.65);
    }

    // Incandescence boost for core stars
    float coreIncandescence = smoothstep(0.22, 0.0, vRadius) * 1.8;
    vec3 finalLinearColor = (col + vec3(coreIncandescence * 0.7)) * vBrightness;

    gl_FragColor = vec4(finalLinearColor, tex.a * 0.92);

    #include <colorspace_fragment>
  }
`;

// 2. DIFFUSE GLOW LAYER SHADERS (10k points, 12x size, alpha 0.035-0.055, additive)
const galaxyGlowVertexShader = `
  uniform float uTime;
  attribute float aRadius;
  attribute float aRandom;

  varying float vRadius;
  varying float vRandom;

  void main() {
    vRadius = aRadius;
    vRandom = aRandom;

    float r = length(position.xz);
    float angVel = 0.040 / (0.65 + r * 0.65);
    float angle = uTime * angVel;

    float c = cos(angle);
    float s = sin(angle);
    vec3 rotatedPos = vec3(
      position.x * c - position.z * s,
      position.y,
      position.x * s + position.z * c
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Large diffuse glow points (approx 12x normal particle size)
    gl_PointSize = max(4.0, 0.28 * (220.0 / -mvPosition.z));
  }
`;

const galaxyGlowFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uColorCore;
  uniform vec3 uColorMid;
  uniform vec3 uColorOuter;

  varying float vRadius;
  varying float vRandom;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;

    float rMod = clamp(vRadius + (vRandom - 0.5) * 0.2, 0.0, 1.0);
    vec3 col = rMod < 0.35 
      ? mix(uColorCore, uColorMid, smoothstep(0.0, 0.35, rMod)) 
      : mix(uColorMid, uColorOuter, smoothstep(0.35, 1.0, rMod));

    // Very low alpha (0.035 - 0.055) creating soft atmospheric nebulosity along arms
    float alpha = tex.a * 0.048;
    gl_FragColor = vec4(col, alpha);

    #include <colorspace_fragment>
  }
`;

// 3. DARK DUST LANES SHADERS (Normal blending, alpha 0.25, inner arm edges)
const galaxyDarkDustVertexShader = `
  uniform float uTime;

  void main() {
    float r = length(position.xz);
    float angVel = 0.040 / (0.65 + r * 0.65);
    float angle = uTime * angVel;

    float c = cos(angle);
    float s = sin(angle);
    vec3 rotatedPos = vec3(
      position.x * c - position.z * s,
      position.y,
      position.x * s + position.z * c
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = max(2.5, 0.065 * (220.0 / -mvPosition.z));
  }
`;

const galaxyDarkDustFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uColorDark;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.02) discard;

    // Normal blending dark absorption silhouettes (max 4 translucent layers per pixel)
    gl_FragColor = vec4(uColorDark, tex.a * 0.25);

    #include <colorspace_fragment>
  }
`;

// 4. YOUNG BLUE STARS SHADERS (Brilliant #8ec5ff on outer arm edges)
const galaxyYoungBlueVertexShader = `
  uniform float uTime;
  attribute float aPhase;
  varying float vTwinkle;

  void main() {
    float r = length(position.xz);
    float angVel = 0.040 / (0.65 + r * 0.65);
    float angle = uTime * angVel;

    float c = cos(angle);
    float s = sin(angle);
    vec3 rotatedPos = vec3(
      position.x * c - position.z * s,
      position.y,
      position.x * s + position.z * c
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float twinkle = 0.8 + 0.3 * sin(uTime * 2.8 + aPhase);
    vTwinkle = twinkle;
    gl_PointSize = max(2.0, 0.038 * (220.0 / -mvPosition.z) * twinkle);
  }
`;

const galaxyYoungBlueFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uColorBlue;
  varying float vTwinkle;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.05) discard;

    gl_FragColor = vec4(uColorBlue * (1.2 * vTwinkle), tex.a * 0.95);

    #include <colorspace_fragment>
  }
`;

// 5. CORE HALO SPRITE SHADERS (Large central bulbo with slow +-4% pulse)
const galaxyCoreHaloVertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Slow breathing pulse (+-4%)
    float pulse = 1.0 + 0.04 * sin(uTime * 0.6);
    vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 mvPosition = mvCenter + vec4((uv - vec2(0.5)) * 3.4 * pulse, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const galaxyCoreHaloFragmentShader = `
  uniform sampler2D uMap;

  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.005) discard;
    gl_FragColor = vec4(tex.rgb * 1.35, tex.a * 0.85);

    #include <colorspace_fragment>
  }
`;

// Standard Box-Muller Gaussian Random Generator
function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function Galaxy({ isMobile = false }: GalaxyProps) {
  const mainPointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);
  const darkDustRef = useRef<THREE.Points>(null);
  const youngBlueRef = useRef<THREE.Points>(null);
  const coreHaloRef = useRef<THREE.Mesh>(null);

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);
  const coreHaloTexture = useMemo(() => getGalaxyCoreHaloTexture(), []);

  // Budget counts
  const mainCount = isMobile ? SPACE_BUDGETS.mobile.galaxy : SPACE_BUDGETS.desktop.galaxy; // 60k mobile, 160k desktop
  const glowCount = isMobile ? 4000 : 10000;
  const darkDustCount = isMobile ? 2500 : 6000;
  const youngBlueCount = isMobile ? 1200 : 3000;

  // Exact requested color palette converted to linear space
  const linearColors = useMemo(() => {
    return {
      core: new THREE.Color('#ffcf8a').convertSRGBToLinear(),
      mid: new THREE.Color('#ec4899').convertSRGBToLinear(),
      outer: new THREE.Color('#8b5cf6').convertSRGBToLinear(),
      accent: new THREE.Color('#38bdf8').convertSRGBToLinear(),
      darkDust: new THREE.Color('#12071f').convertSRGBToLinear(),
      youngBlue: new THREE.Color('#8ec5ff').convertSRGBToLinear(),
    };
  }, []);

  const maxRadius = 8.0;
  const spin = 1.12;
  const branches = 4;

  // 1. MAIN POPULATION GEOMETRY & MATERIAL (160 000 particles)
  const [mainGeometry, mainMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(mainCount * 3);
    const radii = new Float32Array(mainCount);
    const randoms = new Float32Array(mainCount);
    const brightness = new Float32Array(mainCount);

    for (let i = 0; i < mainCount; i++) {
      const isBulge = i < mainCount * 0.22;
      let r: number;
      let theta: number;
      let y: number;

      if (isBulge) {
        // Thick central spheroid merging into the arms
        r = Math.pow(Math.random(), 0.95) * 1.85;
        theta = Math.random() * Math.PI * 2;
        // Flattened spheroid bulge thickness
        const bulgeCos = Math.cos((r / 1.85) * Math.PI * 0.5);
        y = gaussianRandom() * (0.34 * bulgeCos);
      } else {
        // Spiral arms: continuous mass distribution across entire radius
        r = 0.65 + Math.pow(Math.random(), 0.88) * (maxRadius - 0.65);
        const branchIndex = i % branches;
        const branchAngle = (branchIndex / branches) * Math.PI * 2;
        const spinAngle = r * spin;

        // Narrow Gaussian dispersion perpendicular to the arm
        const normSpread = 0.05 + Math.pow(r / maxRadius, 1.15) * 0.18;
        const perpOffset = gaussianRandom() * normSpread;

        const baseAngle = branchAngle + spinAngle;
        theta = baseAngle + perpOffset / r;

        // Ultra-thin disk thickness
        y = gaussianRandom() * (0.04 + (r / maxRadius) * 0.05);
      }

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      radii[i] = r / maxRadius;
      randoms[i] = Math.random();

      // Core stars have higher luminance, arms have rich individual star contrast
      const baseLum = isBulge ? 0.9 + Math.random() * 0.5 : 0.6 + Math.pow(Math.random(), 2.0) * 0.7;
      brightness[i] = baseLum;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: galaxyMainVertexShader,
      fragmentShader: galaxyMainFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uColorCore: { value: linearColors.core },
        uColorMid: { value: linearColors.mid },
        uColorOuter: { value: linearColors.outer },
        uColorAccent: { value: linearColors.accent },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [mainCount, maxRadius, spin, branches, circleTexture, linearColors]);

  // 2. GLOW LAYER GEOMETRY & MATERIAL (10 000 particles, large points, alpha 0.048, additive)
  const [glowGeometry, glowMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(glowCount * 3);
    const radii = new Float32Array(glowCount);
    const randoms = new Float32Array(glowCount);

    for (let i = 0; i < glowCount; i++) {
      const r = 0.5 + Math.pow(Math.random(), 0.9) * (maxRadius - 0.5);
      const branchIndex = i % branches;
      const branchAngle = (branchIndex / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      // Wider soft gaussian distribution across the arms
      const normSpread = 0.12 + Math.pow(r / maxRadius, 1.1) * 0.32;
      const perpOffset = gaussianRandom() * normSpread;
      const theta = branchAngle + spinAngle + perpOffset / r;

      const y = gaussianRandom() * (0.08 + (r / maxRadius) * 0.08);

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      radii[i] = r / maxRadius;
      randoms[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: galaxyGlowVertexShader,
      fragmentShader: galaxyGlowFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uColorCore: { value: linearColors.core },
        uColorMid: { value: linearColors.mid },
        uColorOuter: { value: linearColors.outer },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [glowCount, maxRadius, spin, branches, circleTexture, linearColors]);

  // 3. DARK DUST LANES (6 000 particles, #12071f, normal blending on inner edge of arms)
  const [darkDustGeometry, darkDustMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(darkDustCount * 3);

    for (let i = 0; i < darkDustCount; i++) {
      // Dust lanes run along inner edge from r = 1.0 to 7.2
      const r = 1.0 + Math.pow(Math.random(), 0.85) * 6.2;
      const branchIndex = i % branches;
      const branchAngle = (branchIndex / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      // Shift slightly to inner edge of arm: -0.15 rad offset
      const innerShift = -0.16 + (gaussianRandom() * 0.04);
      const theta = branchAngle + spinAngle + innerShift;

      const y = gaussianRandom() * 0.025;

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: galaxyDarkDustVertexShader,
      fragmentShader: galaxyDarkDustFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uColorDark: { value: linearColors.darkDust },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    return [geo, mat];
  }, [darkDustCount, spin, branches, circleTexture, linearColors]);

  // 4. YOUNG BLUE STARS (3 000 particles, #8ec5ff on outer edge of arms)
  const [youngBlueGeometry, youngBlueMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(youngBlueCount * 3);
    const phases = new Float32Array(youngBlueCount);

    for (let i = 0; i < youngBlueCount; i++) {
      // Clustered in outer arm zones (r = 2.4 to 7.8)
      const r = 2.4 + Math.pow(Math.random(), 0.82) * 5.4;
      const branchIndex = i % branches;
      const branchAngle = (branchIndex / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      // Shift slightly to outer edge of arm: +0.12 rad offset
      const outerShift = 0.12 + (gaussianRandom() * 0.05);
      const theta = branchAngle + spinAngle + outerShift;

      const y = gaussianRandom() * 0.035;

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: galaxyYoungBlueVertexShader,
      fragmentShader: galaxyYoungBlueFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uColorBlue: { value: linearColors.youngBlue },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [youngBlueCount, spin, branches, circleTexture, linearColors]);

  // 5. CORE HALO RADIAL SPRITE MATERIAL
  const coreHaloMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: galaxyCoreHaloVertexShader,
      fragmentShader: galaxyCoreHaloFragmentShader,
      uniforms: {
        uMap: { value: coreHaloTexture },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [coreHaloTexture]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Update uniform uTime for differential GPU rotation & pulsing
    mainMaterial.uniforms.uTime.value = t;
    glowMaterial.uniforms.uTime.value = t;
    darkDustMaterial.uniforms.uTime.value = t;
    youngBlueMaterial.uniforms.uTime.value = t;
    coreHaloMaterial.uniforms.uTime.value = t;

    // PerformanceMonitor adaptive draw ranges
    const quality = spaceStore.getState().qualityLevel;
    const ratio = quality === 'low' ? 0.38 : quality === 'medium' ? 0.65 : 1.0;

    mainGeometry.setDrawRange(0, Math.floor(mainCount * ratio));
    glowGeometry.setDrawRange(0, Math.floor(glowCount * ratio));
    darkDustGeometry.setDrawRange(0, Math.floor(darkDustCount * ratio));
    youngBlueGeometry.setDrawRange(0, Math.floor(youngBlueCount * ratio));
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Dense Spiral Population (160 000 stars) */}
      <points ref={mainPointsRef} geometry={mainGeometry} material={mainMaterial} />

      {/* 2. Soft Atmospheric Glow Layer along the 4 Arms (10 000 points, 12x size) */}
      <points ref={glowPointsRef} geometry={glowGeometry} material={glowMaterial} />

      {/* 3. Dark Interstellar Dust Absorption Lanes (6 000 particles, Normal blending) */}
      <points ref={darkDustRef} geometry={darkDustGeometry} material={darkDustMaterial} />

      {/* 4. Young Brilliant Blue Stars on Outer Arm Edges (3 000 particles) */}
      <points ref={youngBlueRef} geometry={youngBlueGeometry} material={youngBlueMaterial} />

      {/* 5. Core Bulge Radial Halo Sprite with slow +-4% pulse */}
      <mesh ref={coreHaloRef} material={coreHaloMaterial}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}
