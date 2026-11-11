/**
 * Event bus persistente v3 para Universo Interactivo:
 * - Rotación multi-eje ligada a scroll maestro
 * - Constelaciones y Planetas por caso de estudio
 * - Ripple de clic 3D ("Gota en el mar") con raycasting
 */

export type SceneSectionState = 'HERO' | 'OVERVIEW' | 'CASE_STUDY' | 'CONTACT';

export interface RippleItem {
  id: number;
  x: number;
  y: number;
  z: number;
  timestamp: number;
  intensity: number;
}

export interface SceneStatePayload {
  section: SceneSectionState;
  slug?: string | null;
  dispersion: number;       // 0 (convergente) a 1 (máxima dispersión)
  clusterCount: number;     // 0 = libre, 1 = foco único ámbar, 4 = constelaciones, N = proyecto
  density: number;          // 0.3 a 1.0 (modulación de visibilidad/escala, nunca reasignación)
  accentOverride?: string;  // Para el punto ámbar en Contact (#b8874a)
  scrollProgress: number;   // Progreso maestro 0 -> 1
  projectIndex: number;     // Índice del proyecto activo (0 a 4)
  activeBranchIndex?: number | null; // Brazo galáctico activo (0: Frontend, 1: Middleware, 2: Core, 3: Infra)
  pulseTrigger?: { x: number; y: number; z: number; timestamp: number };
}

type SceneStateCallback = (state: SceneStatePayload) => void;
type RippleCallback = (ripple: RippleItem) => void;

class SceneBridge {
  private currentState: SceneStatePayload = {
    section: 'HERO',
    slug: null,
    dispersion: 1.0,
    clusterCount: 0,
    density: 0.4,
    scrollProgress: 0,
    projectIndex: 0,
    activeBranchIndex: null,
  };

  private listeners: Set<SceneStateCallback> = new Set();
  private rippleListeners: Set<RippleCallback> = new Set();
  private nextRippleId = 1;

  public mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Seguimiento de cursor para parallax sutil (±3°)
      window.addEventListener(
        'pointermove',
        (e) => {
          this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
          this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        },
        { passive: true }
      );

      // 2. Interacción de clic: "Gota en el mar" (Ripple 3D)
      window.addEventListener(
        'pointerdown',
        (e) => {
          // Ignorar clics sobre elementos interactivos para no interferir con la navegación/formularios
          const target = e.target as HTMLElement | null;
          if (
            target?.closest(
              'a, button, input, textarea, select, [role="button"], [role="tab"], label, form, .no-ripple'
            )
          ) {
            return;
          }

          // Raycasting al plano imaginario z = 0 a la profundidad del campo estelar
          // Cámara en z = 7.2 con FOV vertical de 55°
          const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
          const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;

          // Proyección al plano galáctico (ejes X y Z en la espiral de partículas)
          const worldX = ndcX * 7.5;
          const worldY = 0;
          const worldZ = -ndcY * 7.5;

          this.triggerRipple(worldX, worldY, worldZ);
        },
        { passive: true }
      );
    }
  }

  public setState(payload: Partial<SceneStatePayload>) {
    this.currentState = {
      ...this.currentState,
      ...payload,
    };
    this.notify();
  }

  public setScrollProgress(progress: number) {
    this.currentState.scrollProgress = progress;
    this.notify();
  }

  public triggerPulse(x: number, y: number, z: number) {
    this.currentState.pulseTrigger = { x, y, z, timestamp: Date.now() };
    this.notify();
  }

  public triggerRipple(x: number, y: number, z: number = 0, intensity: number = 1.0) {
    const ripple: RippleItem = {
      id: this.nextRippleId++,
      x,
      y,
      z,
      timestamp: Date.now(),
      intensity,
    };
    this.rippleListeners.forEach((callback) => callback(ripple));
  }

  public onRipple(callback: RippleCallback): () => void {
    this.rippleListeners.add(callback);
    return () => {
      this.rippleListeners.delete(callback);
    };
  }

  public setActiveBranch(branchIndex: number | null) {
    this.currentState.activeBranchIndex = branchIndex;
    this.notify();
  }

  public setActiveProject(slug: string | null, index: number = 0) {
    if (slug) {
      const densityMap: Record<string, number> = {
        'plaza-gran-via-sur': 1.0,
        'grupo-saom-cas': 0.8,
        'dashboard-erp-headless': 0.7,
        'redferee': 0.55,
        'sportk': 0.4,
      };

      this.setState({
        section: 'CASE_STUDY',
        slug,
        projectIndex: index,
        dispersion: 0.25,
        clusterCount: slug === 'plaza-gran-via-sur' ? 6 : 4,
        density: densityMap[slug] || 0.6,
        accentOverride: undefined,
      });
    } else {
      this.setState({
        section: 'HERO',
        slug: null,
        dispersion: 1.0,
        clusterCount: 0,
        density: 0.4,
        accentOverride: undefined,
      });
    }
  }

  public getCurrentState(): SceneStatePayload {
    return this.currentState;
  }

  private notify() {
    this.listeners.forEach((callback) => callback(this.currentState));
  }

  public subscribe(callback: SceneStateCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentState);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

declare global {
  interface Window {
    __SCENE_BRIDGE__?: SceneBridge;
  }
}

export const sceneBridge: SceneBridge =
  typeof window !== 'undefined'
    ? (window.__SCENE_BRIDGE__ = window.__SCENE_BRIDGE__ || new SceneBridge())
    : ({} as SceneBridge);

