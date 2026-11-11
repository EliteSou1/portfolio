'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { debugStore } from './debugStore';

export function TelemetryTracker() {
  const { gl } = useThree();

  const frames = useRef(0);
  const prevTime = useRef(performance.now());
  const fpsAccum = useRef(60);

  useFrame(() => {
    const isDebug = debugStore.getState().enabled;
    if (!isDebug) return;

    frames.current++;
    const now = performance.now();
    const elapsed = now - prevTime.current;

    // Sample stats every 300ms
    if (elapsed >= 300) {
      const currentFps = (frames.current * 1000) / elapsed;
      fpsAccum.current = fpsAccum.current * 0.7 + currentFps * 0.3; // Moving average
      const ms = 1000 / Math.max(1, currentFps);

      const info = gl.info;
      debugStore.setState({
        fps: fpsAccum.current,
        frameMs: ms,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        programs: info.programs ? info.programs.length : 0,
      });

      frames.current = 0;
      prevTime.current = now;
    }
  });

  return null;
}
