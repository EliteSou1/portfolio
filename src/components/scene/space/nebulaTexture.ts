import * as THREE from 'three';

let cachedNebulaTexture: THREE.CanvasTexture | null = null;
let cachedDarkDustTexture: THREE.CanvasTexture | null = null;

// Permutation table for fast 2D simplex/perlin-like noise
const PERM = new Uint8Array(512);
for (let i = 0; i < 256; i++) {
  PERM[i] = i;
}
for (let i = 255; i > 0; i--) {
  const r = Math.floor(Math.random() * (i + 1));
  const tmp = PERM[i];
  PERM[i] = PERM[r];
  PERM[r] = tmp;
}
for (let i = 0; i < 256; i++) {
  PERM[i + 256] = PERM[i];
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  // Smooth quintic fade: 6t^5 - 15t^4 + 10t^3
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

  const a = PERM[X] + Y;
  const b = PERM[X + 1] + Y;

  const g00 = grad(PERM[a], xf, yf);
  const g10 = grad(PERM[b], xf - 1, yf);
  const g01 = grad(PERM[a + 1], xf, yf - 1);
  const g11 = grad(PERM[b + 1], xf - 1, yf - 1);

  const x1 = g00 + u * (g10 - g00);
  const x2 = g01 + u * (g11 - g01);

  return x1 + v * (x2 - x1);
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.55;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += noise2D(x * freq, y * freq) * amp;
    freq *= 2.05;
    amp *= 0.48;
  }
  return val;
}

/**
 * Generates a high-fidelity 512x512 baked fractal noise texture once and caches it.
 * Used across all nebula billboarding quads.
 */
export function getNebulaTexture(): THREE.CanvasTexture {
  if (cachedNebulaTexture) return cachedNebulaTexture;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const half = size * 0.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Radial falloff from center (0 at edge, 1 at center)
      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const falloff = Math.max(0, 1.0 - Math.pow(dist, 1.4));

      if (falloff <= 0.001) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
        continue;
      }

      // Domain warped fractal noise
      const nx = (x / size) * 3.8;
      const ny = (y / size) * 3.8;
      const warp = fbm(nx + 1.2, ny + 0.8, 3) * 0.45;
      const n = (fbm(nx + warp, ny + warp, 5) + 1.0) * 0.5; // [0, 1]

      // Organic cottony gas density curve
      const density = Math.pow(n, 1.3) * falloff;
      const alpha = Math.min(255, Math.floor(density * 255));

      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  cachedNebulaTexture = texture;
  return cachedNebulaTexture;
}

/**
 * Generates an opaque dark interstellar dust silhouette texture (Great Rift / Horsehead style)
 * Carves deep absorption lanes within additive glowing nebular clouds.
 */
export function getDarkDustTexture(): THREE.CanvasTexture {
  if (cachedDarkDustTexture) return cachedDarkDustTexture;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const half = size * 0.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const falloff = Math.max(0, 1.0 - Math.pow(dist, 1.8));

      if (falloff <= 0.001) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
        continue;
      }

      // High-contrast tendril noise for dark rifts
      const nx = (x / size) * 4.5;
      const ny = (y / size) * 4.5;
      const n = (fbm(nx + 3.7, ny + 2.1, 4) + 1.0) * 0.5;

      // Thresholding to form dark clumps and tendrils
      const riftShape = Math.pow(Math.max(0, n - 0.38) * 1.6, 2.0) * falloff;
      const alpha = Math.min(255, Math.floor(riftShape * 220));

      data[idx] = 4;
      data[idx + 1] = 3;
      data[idx + 2] = 8;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  cachedDarkDustTexture = texture;
  return cachedDarkDustTexture;
}
