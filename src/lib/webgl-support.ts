/**
 * Utilidad de detección de WebGL y cálculo de presupuesto de partículas por hardware.
 */

export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function getRecommendedParticleCount(): number {
  if (typeof window === 'undefined') return 45000;

  const isMobile = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile || cores <= 2) {
    return 18000;
  }

  if (cores >= 8) {
    return 60000;
  }

  return 45000;
}
