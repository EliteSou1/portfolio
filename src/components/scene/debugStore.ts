import { useSyncExternalStore } from 'react';

export interface DebugState {
  enabled: boolean;
  dpr: number;
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  programs: number;
}

function parseUrlParams(): Partial<DebugState> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const isDebug = params.get('debug') === '1';
  if (!isDebug) return { enabled: false };

  const dpr = parseFloat(params.get('dpr') || '1.5');

  return {
    enabled: true,
    dpr: isNaN(dpr) ? 1.5 : dpr,
  };
}

const initial = parseUrlParams();

const currentDebugState: DebugState = {
  enabled: initial.enabled || false,
  dpr: initial.dpr || 1.5,
  fps: 60,
  frameMs: 16.6,
  drawCalls: 0,
  triangles: 0,
  programs: 0,
};

const debugListeners = new Set<() => void>();

function emitDebug() {
  for (const listener of debugListeners) {
    listener();
  }
}

export const debugStore = {
  getState(): DebugState {
    return currentDebugState;
  },
  setState(partial: Partial<DebugState>) {
    Object.assign(currentDebugState, partial);
    emitDebug();
  },
  syncUrl() {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (currentDebugState.enabled) {
      url.searchParams.set('debug', '1');
      url.searchParams.set('dpr', currentDebugState.dpr.toString());
    } else {
      url.searchParams.delete('debug');
      url.searchParams.delete('dpr');
    }
    window.history.replaceState({}, '', url.toString());
  },
  subscribe(listener: () => void) {
    debugListeners.add(listener);
    return () => {
      debugListeners.delete(listener);
    };
  },
};

export function useDebugStore<T>(selector: (state: DebugState) => T): T {
  return useSyncExternalStore(
    debugStore.subscribe,
    () => selector(debugStore.getState()),
    () => selector(debugStore.getState())
  );
}
