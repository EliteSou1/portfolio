'use client';

import React, { useState, useEffect } from 'react';
import { useDebugStore, debugStore, DebugState } from '../scene/debugStore';
import { Activity, X, Compass } from 'lucide-react';
import { spaceStore } from '../scene/space/spaceStore';
import { QualityLevel } from '@/lib/spaceConfig';

export function DebugPanel() {
  const [mounted, setMounted] = useState(false);
  const enabled = useDebugStore((s: DebugState) => s.enabled);
  const dpr = useDebugStore((s: DebugState) => s.dpr);
  const fps = useDebugStore((s: DebugState) => s.fps);
  const frameMs = useDebugStore((s: DebugState) => s.frameMs);
  const drawCalls = useDebugStore((s: DebugState) => s.drawCalls);
  const triangles = useDebugStore((s: DebugState) => s.triangles);
  const programs = useDebugStore((s: DebugState) => s.programs);

  const [journeyProgress, setJourneyProgress] = useState(0);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>('high');
  const [cullStatus, setCullStatus] = useState(spaceStore.getState().cullStatus);

  useEffect(() => {
    setMounted(true);
    const unsub = spaceStore.subscribe(() => {
      const state = spaceStore.getState();
      setJourneyProgress(state.journeyProgress);
      setQualityLevel(state.qualityLevel);
      setCullStatus({ ...state.cullStatus });
    });
    return unsub;
  }, []);

  if (!mounted || !enabled) return null;

  const setDpr = (newDpr: number) => {
    debugStore.setState({ dpr: newDpr });
    debugStore.syncUrl();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setJourneyProgress(val);
    spaceStore.setJourneyProgress(val);
  };

  const jumpToZone = (t: number) => {
    setJourneyProgress(t);
    spaceStore.setJourneyProgress(t);
  };

  const handleQualityChange = (q: QualityLevel) => {
    spaceStore.setQualityLevel(q);
  };

  // Human-readable active zone
  const getZoneLabel = (p: number) => {
    if (p < 0.1) return 'Hero: Galaxia (0, 6, 12)';
    if (p < 0.3) return 'Zona Nebulosa A (-18, 4, -30)';
    if (p < 0.5) return 'Zona Nebulosa B (22, -6, -55)';
    if (p < 0.7) return 'Zona Cinturón Asteroides (6, 0, -80)';
    if (p < 0.9) return 'Zona Nebulosa C (-10, 8, -110)';
    return 'Zona Agujero Negro (0, 0, -150)';
  };

  return (
    <div
      translate="no"
      className="fixed top-4 left-4 z-50 pointer-events-auto w-84 max-h-[92vh] overflow-y-auto rounded-xl
        border border-[#1b3442] bg-[#03080c]/92 backdrop-blur-xl p-4 text-[#a3c7d4] font-mono text-xs shadow-2xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#142833] pb-2">
        <div className="flex items-center gap-2 text-[#3ce8f3] font-bold">
          <Activity className="w-4 h-4" />
          <span>GPU TELEMETRY // DEEP SPACE</span>
        </div>
        <button
          onClick={() => {
            debugStore.setState({ enabled: false });
          }}
          className="text-[#557885] hover:text-[#e8f6fa]"
          title="Cerrar panel de depuración"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Realtime Metrics */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#071219] border border-[#122530]">
        <div>
          <span className="text-[10px] text-[#4d707d] block">FPS</span>
          <span
            className={`text-lg font-bold ${
              fps >= 55 ? 'text-[#3ce8f3]' : fps >= 30 ? 'text-[#ffb55a]' : 'text-[#ff5555]'
            }`}
          >
            {fps.toFixed(0)}
          </span>
          <span className="text-[10px] text-[#4d707d] ml-1">({frameMs.toFixed(1)}ms)</span>
        </div>
        <div>
          <span className="text-[10px] text-[#4d707d] block">DRAW CALLS</span>
          <span
            className={`text-lg font-bold ${
              drawCalls <= 35 ? 'text-[#3ce8f3]' : 'text-[#ff5555]'
            }`}
          >
            {drawCalls}{' '}
            <span className="text-[10px] font-normal text-[#587e8d]">/ 35 max</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#4d707d] block">TRIANGLES</span>
          <span className="text-sm font-semibold text-[#8eb2c0]">
            {(triangles / 1000).toFixed(1)}k
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#4d707d] block">SHADERS (PROG)</span>
          <span className="text-sm font-semibold text-[#8eb2c0]">{programs}</span>
        </div>
      </div>

      {/* JOURNEY PATH SLIDER */}
      <div className="space-y-2 border-t border-[#142833] pt-3">
        <div className="flex items-center justify-between text-[#3ce8f3]">
          <span className="flex items-center gap-1.5 font-bold text-[11px]">
            <Compass className="w-3.5 h-3.5" />
            <span>RECORRIDO JOURNEY_PATH</span>
          </span>
          <span className="text-[10px] text-[#699cb0]">
            t = {journeyProgress.toFixed(3)}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={journeyProgress}
          onChange={handleSliderChange}
          className="w-full accent-[#3ce8f3] cursor-pointer bg-[#07131b] h-2 rounded"
        />

        <div className="text-[10px] text-[#86afbe] truncate">
          ▶ <span className="text-[#e2f1f7]">{getZoneLabel(journeyProgress)}</span>
        </div>

        {/* Quick Jump Buttons */}
        <div className="grid grid-cols-3 gap-1 pt-1">
          {[
            { label: 'Hero (0.0)', t: 0.0 },
            { label: 'Neb A (0.2)', t: 0.2 },
            { label: 'Neb B (0.4)', t: 0.4 },
            { label: 'Ast (0.6)', t: 0.6 },
            { label: 'Neb C (0.8)', t: 0.8 },
            { label: 'Sing (1.0)', t: 1.0 },
          ].map((zone) => (
            <button
              key={zone.label}
              onClick={() => jumpToZone(zone.t)}
              className={`py-1 px-1 text-[10px] rounded border transition-all text-center ${
                Math.abs(journeyProgress - zone.t) < 0.09
                  ? 'border-[#3ce8f3] bg-[#0c2733] text-[#3ce8f3] font-bold'
                  : 'border-[#142833] bg-[#061017] text-[#618594] hover:text-[#b4d6e2]'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* ADAPTIVE QUALITY PRESET */}
      <div className="space-y-1.5 border-t border-[#142833] pt-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[#4d707d] block">
            CALIDAD ADAPTATIVA (DREI)
          </label>
          <span className="text-[10px] uppercase font-bold text-[#3ce8f3]">
            {qualityLevel}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['high', 'medium', 'low'] as QualityLevel[]).map((q) => (
            <button
              key={q}
              onClick={() => handleQualityChange(q)}
              className={`py-1 text-center rounded border uppercase transition-all ${
                qualityLevel === q
                  ? 'border-[#3ce8f3] bg-[#0c2733] text-[#3ce8f3] font-bold'
                  : 'border-[#142833] bg-[#061017] text-[#618594] hover:text-[#b4d6e2]'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ZONE CULLING TELEMETRY STATUS */}
      <div className="space-y-1.5 border-t border-[#142833] pt-3">
        <label className="text-[10px] text-[#4d707d] block mb-1">
          ESTADO DE CULLING POR ZONA
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {[
            { label: 'Nebulosa A', active: cullStatus.nebulaA },
            { label: 'Nebulosa B', active: cullStatus.nebulaB },
            { label: 'Asteroides', active: cullStatus.asteroids },
            { label: 'Nebulosa C', active: cullStatus.nebulaC },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-1.5 rounded border flex items-center justify-between ${
                item.active
                  ? 'border-[#22c55e]/40 bg-[#062013]/60 text-[#4ade80]'
                  : 'border-[#142833] bg-[#061017] text-[#527481]'
              }`}
            >
              <span>{item.label}</span>
              <span className="font-bold">{item.active ? 'ACTIVO' : 'CULLED'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DPR Selector */}
      <div className="border-t border-[#142833] pt-3">
        <label className="text-[10px] text-[#4d707d] block mb-1">
          DEVICE PIXEL RATIO (DPR)
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 1.25, 1.5, 2].map((val) => (
            <button
              key={val}
              onClick={() => setDpr(val)}
              className={`py-1 text-center rounded border transition-all ${
                dpr === val
                  ? 'border-[#3ce8f3] bg-[#0c2733] text-[#3ce8f3] font-bold'
                  : 'border-[#142833] bg-[#061017] text-[#618594] hover:text-[#b4d6e2]'
              }`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
