import * as THREE from 'three';
import { QualityLevel } from '@/lib/spaceConfig';

export interface SpaceState {
  journeyProgress: number; // 0 to 1
  isJourneyActive: boolean;
  qualityLevel: QualityLevel;
  activeNebulaIndex: number;
  // Mouse in world coordinates for dust repulsion
  mouseWorld: THREE.Vector3;
  mouseActive: boolean;
  // Zone visibility flags for culling introspection
  cullStatus: {
    hero: boolean;
    nebulaA: boolean;
    nebulaB: boolean;
    asteroids: boolean;
    nebulaC: boolean;
  };
}

const currentSpaceState: SpaceState = {
  journeyProgress: 0,
  isJourneyActive: false,
  qualityLevel: 'high',
  activeNebulaIndex: 0,
  mouseWorld: new THREE.Vector3(0, 0, 0),
  mouseActive: false,
  cullStatus: {
    hero: true,
    nebulaA: false,
    nebulaB: false,
    asteroids: false,
    nebulaC: false,
  },
};

const spaceListeners = new Set<() => void>();

export const spaceStore = {
  getState(): SpaceState {
    return currentSpaceState;
  },
  setState(partial: Partial<SpaceState>) {
    Object.assign(currentSpaceState, partial);
    for (const listener of spaceListeners) {
      listener();
    }
  },
  subscribe(listener: () => void) {
    spaceListeners.add(listener);
    return () => {
      spaceListeners.delete(listener);
    };
  },
  setJourneyProgress(progress: number) {
    currentSpaceState.journeyProgress = Math.max(0, Math.min(1, progress));
    currentSpaceState.isJourneyActive = true;
    for (const listener of spaceListeners) {
      listener();
    }
  },
  setQualityLevel(quality: QualityLevel) {
    if (currentSpaceState.qualityLevel !== quality) {
      currentSpaceState.qualityLevel = quality;
      for (const listener of spaceListeners) {
        listener();
      }
    }
  },
};
