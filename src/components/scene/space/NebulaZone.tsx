'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getNebulaTexture, getDarkDustTexture } from './nebulaTexture';
import { spaceStore } from './spaceStore';
import { getParticleCircleTexture } from '@/lib/particle-texture';

interface NebulaZoneProps {
  id: 'nebulaA' | 'nebulaB' | 'nebulaC';
  position: [number, number, number];
  primaryColor: string;
  secondaryColor: string;
  darkDustColor: string;
  cullDistance?: number;
  starCount?: number;
}

const nebulaQuadVertexShader = `
  uniform float uRotation;
  varying vec2 vUv;

  void main() {
    // Rotate UVs around center (0.5, 0.5) to achieve smooth continuous spinning in GPU
    vec2 centered = uv - vec2(0.5);
    float c = cos(uRotation);
    float s = sin(uRotation);
    mat2 rot = mat2(c, -s, s, c);
    vUv = rot * centered + vec2(0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaQuadFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uBaseAlpha;
  uniform float uTime;
  uniform float uBreathSpeed;
  uniform float uBreathPhase;
  varying vec2 vUv;

  void main() {
    if (vUv.x < 0.0 || vUv.x > 1.0 || vUv.y < 0.0 || vUv.y > 1.0) {
      discard;
    }
    vec4 tex = texture2D(uMap, vUv);
    // Very subtle static/calm cloud: no distracting pulsation
    float breath = 1.0 + 0.015 * sin(uTime * 0.2 + uBreathPhase);
    float a = tex.a * uBaseAlpha * breath * 0.65; // Softened contrast
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * tex.rgb, a);
  }
`;

const youngStarsVertexShader = `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  attribute float aTwinkleSpeed;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    float twinkle = 0.75 + 0.25 * sin(uTime * aTwinkleSpeed + aPhase);
    vAlpha = twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (180.0 / -mvPosition.z) * twinkle;
  }
`;

const youngStarsFragmentShader = `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float alpha = tex.a * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.85);
  }
`;

export function NebulaZone({
  id,
  position,
  primaryColor,
  secondaryColor,
  darkDustColor,
  cullDistance = 65,
  starCount = 300,
}: NebulaZoneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const texture = useMemo(() => getNebulaTexture(), []);
  const darkTexture = useMemo(() => getDarkDustTexture(), []);
  const starCircleTexture = useMemo(() => getParticleCircleTexture(), []);

  const primColor = useMemo(() => new THREE.Color(primaryColor), [primaryColor]);
  const secColor = useMemo(() => new THREE.Color(secondaryColor), [secondaryColor]);
  const darkColor = useMemo(() => new THREE.Color(darkDustColor), [darkDustColor]);

  // Pre-configured layers for depth, parallax and silhouette carve
  // Keep alpha <= 0.35 per layer to prevent overdraw blowout
  const layers = useMemo(() => {
    return [
      {
        id: 'back',
        zOffset: -6.0,
        size: 38.0,
        baseAlpha: 0.24,
        color: secColor,
        rotSpeed: 0.015,
        breathSpeed: 0.7,
        breathPhase: 0.0,
        isDarkDust: false,
      },
      {
        id: 'mid-primary',
        zOffset: -2.0,
        size: 32.0,
        baseAlpha: 0.32,
        color: primColor,
        rotSpeed: -0.022,
        breathSpeed: 0.9,
        breathPhase: 1.8,
        isDarkDust: false,
      },
      {
        // Dark dust layer: NormalBlending with deep absorption silhouettes
        id: 'dark-dust',
        zOffset: 0.5,
        size: 28.0,
        baseAlpha: 0.58,
        color: darkColor,
        rotSpeed: 0.008,
        breathSpeed: 0.5,
        breathPhase: 3.2,
        isDarkDust: true,
      },
      {
        id: 'front-accent',
        zOffset: 3.5,
        size: 26.0,
        baseAlpha: 0.22,
        color: primColor.clone().lerp(new THREE.Color('#ffffff'), 0.25),
        rotSpeed: -0.035,
        breathSpeed: 1.1,
        breathPhase: 4.5,
        isDarkDust: false,
      },
    ];
  }, [primColor, secColor, darkColor]);

  // Shader materials for layers
  const layerMaterials = useMemo(() => {
    return layers.map((layer) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: nebulaQuadVertexShader,
        fragmentShader: nebulaQuadFragmentShader,
        uniforms: {
          uMap: { value: layer.isDarkDust ? darkTexture : texture },
          uColor: { value: layer.color },
          uBaseAlpha: { value: layer.baseAlpha },
          uTime: { value: 0 },
          uRotation: { value: 0 },
          uBreathSpeed: { value: layer.breathSpeed },
          uBreathPhase: { value: layer.breathPhase },
        },
        transparent: true,
        depthWrite: false,
        blending: layer.isDarkDust ? THREE.NormalBlending : THREE.AdditiveBlending,
      });
      return mat;
    });
  }, [layers, texture, darkTexture]);

  // Embedded young stellar population
  const [starGeometry, starMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const speeds = new Float32Array(starCount);

    const mixCol = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      // Gaussian distribution clustered in nebula core (radius ~10 units)
      const u1 = Math.random();
      const u2 = Math.random();
      const radius = Math.sqrt(-2.0 * Math.log(Math.max(1e-5, u1))) * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) * 0.65; // Slightly flattened disk
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Young stars tinted with cloud spectral glow + brilliant blue-white
      const blend = Math.random();
      if (blend < 0.6) {
        mixCol.copy(primColor).lerp(new THREE.Color('#ffffff'), 0.5);
      } else {
        mixCol.copy(secColor).lerp(new THREE.Color('#aee2ff'), 0.6);
      }

      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;

      sizes[i] = 0.08 + Math.random() * 0.16;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 1.5 + Math.random() * 3.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: youngStarsVertexShader,
      fragmentShader: youngStarsFragmentShader,
      uniforms: {
        uMap: { value: starCircleTexture },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [starCount, primColor, secColor, starCircleTexture]);

  // Reusable position vector for distance culling
  const zoneVec = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 1. Precise Zone Culling: Hide entire hierarchy if camera is beyond activation sphere
    const dist = camera.position.distanceTo(zoneVec);
    const isVisible = dist <= cullDistance;

    if (groupRef.current.visible !== isVisible) {
      groupRef.current.visible = isVisible;
      const status = spaceStore.getState().cullStatus;
      if (id === 'nebulaA') status.nebulaA = isVisible;
      if (id === 'nebulaB') status.nebulaB = isVisible;
      if (id === 'nebulaC') status.nebulaC = isVisible;
    }

    if (!isVisible) return;

    // Billboarding: Orient group or individual quads toward camera
    groupRef.current.lookAt(camera.position);

    const t = state.clock.getElapsedTime();

    // 2. Update layer rotation uniforms and breathing times directly in GPU
    for (let i = 0; i < layers.length; i++) {
      const mat = layerMaterials[i];
      mat.uniforms.uTime.value = t;
      mat.uniforms.uRotation.value = t * layers[i].rotSpeed;
    }

    // 3. Update starfield uniforms
    starMaterial.uniforms.uTime.value = t;

    // 4. Adaptive quality draw range adjustments
    const quality = spaceStore.getState().qualityLevel;
    const layerCountActive = quality === 'low' ? 2 : quality === 'medium' ? 3 : 4;

    for (let i = 0; i < layers.length; i++) {
      const child = groupRef.current.children[i];
      if (child) {
        child.visible = i < layerCountActive;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {layers.map((layer, idx) => (
        <mesh key={layer.id} position={[0, 0, layer.zOffset]} material={layerMaterials[idx]}>
          <planeGeometry args={[layer.size, layer.size]} />
        </mesh>
      ))}

      <points ref={starsRef} geometry={starGeometry} material={starMaterial} />
    </group>
  );
}
