'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACE_BUDGETS, SPACE_DYNAMICS } from '@/lib/spaceConfig';
import { getParticleCircleTexture, getStarBurstTexture } from '@/lib/particle-texture';

const cometTailVertexShader = `
  uniform float uTime;
  uniform float uOrbitDuration;

  attribute float aIndex;
  attribute float aSeed;

  varying float vAlpha;
  varying float vIndex;

  // Closed parametric orbital sweeping curve traversing deep space
  vec3 computeCometTrajectory(float t) {
    float p = mod(t / uOrbitDuration, 1.0) * 6.2831853;
    return vec3(
      70.0 * cos(p) - 10.0,
      20.0 * sin(p * 1.5) + 6.0,
      -80.0 + 78.0 * sin(p)
    );
  }

  void main() {
    vIndex = aIndex;

    // Head current position
    vec3 head = computeCometTrajectory(uTime);

    // Approximate tangent velocity vector via infinitesimal backward step
    vec3 prev = computeCometTrajectory(uTime - 0.15);
    vec3 vel = head - prev;
    vec3 tailDir = -normalize(vel);

    // Dynamic solar wind ion tail deflection
    float tailLength = 12.0;
    vec3 basePos = head + tailDir * (aIndex * tailLength);

    // Turbulence / ionic plume expansion
    vec3 side = normalize(cross(tailDir, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(side, tailDir);

    float noiseSide = sin(uTime * 1.5 + aIndex * 8.0 + aSeed * 6.28) * aIndex * 0.8;
    float noiseUp = cos(uTime * 1.2 + aIndex * 6.0 + aSeed * 5.12) * aIndex * 0.6;

    vec3 worldPos = basePos + side * noiseSide + up * noiseUp;

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation: wider ion stream downstream
    float pSize = (0.10 + aIndex * 0.22) * (220.0 / -mvPosition.z);
    gl_PointSize = pSize;

    // Quadratic tail fade
    vAlpha = pow(1.0 - aIndex, 2.0) * 0.45; // Subdued, elegant tail
  }
`;

const cometTailFragmentShader = `
  uniform sampler2D uMap;
  varying float vAlpha;
  varying float vIndex;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float a = tex.a * vAlpha;
    if (a < 0.005) discard;

    // Color gradient: Soft silver cyan to deep atmospheric indigo
    vec3 colHead = vec3(0.55, 0.78, 0.92);
    vec3 colTail = vec3(0.12, 0.25, 0.55);
    vec3 col = mix(colHead, colTail, vIndex);

    gl_FragColor = vec4(col, a * 0.5);
  }
`;

const cometHeadVertexShader = `
  uniform float uTime;
  uniform float uOrbitDuration;

  vec3 computeCometTrajectory(float t) {
    float p = mod(t / uOrbitDuration, 1.0) * 6.2831853;
    return vec3(
      70.0 * cos(p) - 10.0,
      20.0 * sin(p * 1.5) + 6.0,
      -80.0 + 78.0 * sin(p)
    );
  }

  void main() {
    vec3 head = computeCometTrajectory(uTime);
    // Align billboard quad to camera in view space
    vec4 mvCenter = modelViewMatrix * vec4(head, 1.0);
    vec4 mvPosition = mvCenter + vec4(position.x * 3.8, position.y * 3.8, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const cometHeadFragmentShader = `
  uniform sampler2D uMap;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    // Soft pearl white core with faint cyan edge
    vec3 coreColor = vec3(0.95, 0.96, 0.98);
    vec3 comaColor = vec3(0.45, 0.65, 0.85);
    vec3 col = mix(comaColor, coreColor, tex.r);
    gl_FragColor = vec4(col, tex.a * 0.4);
  }
`;

interface CometProps {
  isMobile?: boolean;
}

export function Comet({ isMobile = false }: CometProps) {
  // Omit on mobile devices per optimization requirement
  if (isMobile) return null;

  const tailPointsRef = useRef<THREE.Points>(null);
  const headMeshRef = useRef<THREE.Mesh>(null);

  const circleTexture = useMemo(() => getParticleCircleTexture(), []);
  const starBurstTexture = useMemo(() => getStarBurstTexture(), []);
  const count = SPACE_BUDGETS.desktop.cometTail;
  const orbitDuration = SPACE_DYNAMICS.cometOrbitDuration;

  // 1. Tail Geometry & Material
  const [tailGeometry, tailMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const indices = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      indices[i] = i / count;
      seeds[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: cometTailVertexShader,
      fragmentShader: cometTailFragmentShader,
      uniforms: {
        uMap: { value: circleTexture },
        uTime: { value: 0 },
        uOrbitDuration: { value: orbitDuration },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [count, orbitDuration, circleTexture]);

  // 2. Head Sprite Quad
  const headMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: cometHeadVertexShader,
      fragmentShader: cometHeadFragmentShader,
      uniforms: {
        uMap: { value: starBurstTexture },
        uTime: { value: 0 },
        uOrbitDuration: { value: orbitDuration },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [orbitDuration, starBurstTexture]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    tailMaterial.uniforms.uTime.value = t;
    headMaterial.uniforms.uTime.value = t;
  });

  return (
    <group>
      <points ref={tailPointsRef} geometry={tailGeometry} material={tailMaterial} />
      <mesh ref={headMeshRef} material={headMaterial}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}
