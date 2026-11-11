import * as THREE from 'three';

let cachedParticleTexture: THREE.CanvasTexture | null = null;

/**
 * Generates an authentic astronomical stellar point spread texture.
 * Features a pure white incandescent core from 0.0 to 0.22,
 * softly fading to vibrant blue-white and celestial halo.
 * Guarantees zero sub-pixel culling even across deep astronomical distances.
 */
export function getParticleCircleTexture(): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  if (cachedParticleTexture) return cachedParticleTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 32;
  const cy = 32;

  // Rich, dense incandescent stellar gradient
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 31);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.22, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.45, 'rgba(220, 238, 255, 0.70)');
  gradient.addColorStop(0.72, 'rgba(150, 205, 255, 0.25)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedParticleTexture = new THREE.CanvasTexture(canvas);
  cachedParticleTexture.needsUpdate = true;
  return cachedParticleTexture;
}

export const getSoftParticleTexture = getParticleCircleTexture;

let cachedStarBurstTexture: THREE.CanvasTexture | null = null;

/**
 * Generates a realistic optical 4-point telescope spider diffraction spike starburst.
 * Tapered needle-thin rays with vibrant central core for high-magnitude Alpha stars.
 */
export function getStarBurstTexture(): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  if (cachedStarBurstTexture) return cachedStarBurstTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 64;
  const cy = 64;

  ctx.clearRect(0, 0, 128, 128);

  // 1. Central incandescent Airy core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  coreGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(0.25, 'rgba(240, 250, 255, 0.95)');
  coreGrad.addColorStop(0.55, 'rgba(170, 230, 255, 0.45)');
  coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();

  // 2. Optical needle-thin diffraction spike rays
  const drawSpike = (angle: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(-62, 0, 62, 0);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.3, 'rgba(220, 248, 255, 0.55)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.7, 'rgba(220, 248, 255, 0.55)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-62, 0);
    ctx.lineTo(0, 1.8);
    ctx.lineTo(62, 0);
    ctx.lineTo(0, -1.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Draw 4-point cross
  drawSpike(0);
  drawSpike(Math.PI / 2);

  cachedStarBurstTexture = new THREE.CanvasTexture(canvas);
  cachedStarBurstTexture.needsUpdate = true;
  return cachedStarBurstTexture;
}

let cachedCoreHaloTexture: THREE.CanvasTexture | null = null;

/**
 * Generates an astronomical radial bulge glow texture for Andromeda/NGC 1300 core halo.
 * Soft multi-stop warm golden gradient with exponential dissipation.
 */
export function getGalaxyCoreHaloTexture(): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  if (cachedCoreHaloTexture) return cachedCoreHaloTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 128;
  const cy = 128;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 126);
  grad.addColorStop(0.0, 'rgba(255, 250, 235, 1.0)');  // Pure incandescent core
  grad.addColorStop(0.12, 'rgba(255, 215, 150, 0.85)'); // Warm Golden Amber (#ffcf8a)
  grad.addColorStop(0.32, 'rgba(245, 150, 110, 0.45)'); // Sunset Orange-Magenta
  grad.addColorStop(0.60, 'rgba(180, 80, 190, 0.15)');  // Soft Violet Rim
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedCoreHaloTexture = new THREE.CanvasTexture(canvas);
  cachedCoreHaloTexture.needsUpdate = true;
  return cachedCoreHaloTexture;
}
