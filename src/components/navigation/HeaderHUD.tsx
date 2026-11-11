'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { AbstractAvatar } from '@/components/ui/AbstractAvatar';
import { Volume2, VolumeX, Globe } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function HeaderHUD() {
  const { language, setLanguage, audioActive, toggleAudio, navigateToSection } =
    usePortfolio();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 md:px-8 md:py-6 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Identity */}
      <div className="flex items-center gap-3.5 pointer-events-auto">
        <button
          onClick={() => {
            audioSynth.playSelectTone();
            navigateToSection('home');
          }}
          className="flex items-center gap-3 group focus:outline-none"
          title="Regresar al inicio"
        >
          <AbstractAvatar size="sm" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-[#f1f5f9] group-hover:text-[#ffcf8a] transition-colors uppercase font-medium">
                SAÚL A. RENDÓN COCOM
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffcf8a] animate-pulse" />
            </div>
            <div className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
              CREATIVE TECHNOLOGIST // SYSTEMS
            </div>
          </div>
        </button>
      </div>

      {/* Top Right: ES/EN Selector + Audio Atmosphere Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
        {/* Language Selector ES | EN */}
        <div
          style={{
            backgroundColor: 'rgba(8, 6, 20, 0.65)',
            backdropFilter: 'blur(10px)',
          }}
          className="flex items-center rounded-lg border border-white/10 p-0.5 text-xs font-mono shadow-lg"
        >
          <Globe className="w-3.5 h-3.5 text-[#94a3b8] ml-2 mr-1 hidden sm:block" />
          <button
            onClick={() => {
              audioSynth.playSelectTone();
              setLanguage('es');
            }}
            className={`px-2 py-1 rounded transition-colors duration-200 ${
              language === 'es'
                ? 'bg-[#ffcf8a]/15 text-[#ffcf8a] font-semibold border border-[#ffcf8a]/30'
                : 'text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            ES
          </button>
          <span className="text-white/20 px-0.5">|</span>
          <button
            onClick={() => {
              audioSynth.playSelectTone();
              setLanguage('en');
            }}
            className={`px-2 py-1 rounded transition-colors duration-200 ${
              language === 'en'
                ? 'bg-[#ffcf8a]/15 text-[#ffcf8a] font-semibold border border-[#ffcf8a]/30'
                : 'text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            EN
          </button>
        </div>

        {/* Audio Ambient Atmosphere Toggle */}
        <button
          onClick={() => {
            toggleAudio();
          }}
          style={{
            backgroundColor: 'rgba(8, 6, 20, 0.65)',
            backdropFilter: 'blur(10px)',
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors duration-200 shadow-lg ${
            audioActive
              ? 'border-[#ffcf8a]/40 bg-[#ffcf8a]/10 text-[#ffcf8a]'
              : 'border-white/10 text-[#94a3b8] hover:text-[#f1f5f9] hover:border-white/25'
          }`}
          title={audioActive ? 'Desactivar audio ambiente' : 'Activar audio ambiente'}
        >
          {audioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#ffcf8a] animate-pulse" />
              <span className="hidden sm:inline tracking-wider font-semibold">AUDIO ON</span>
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-[#ffcf8a] h-2 animate-[pulse_0.8s_infinite]" />
                <span className="w-0.5 bg-[#ffcf8a] h-3 animate-[pulse_0.5s_infinite]" />
                <span className="w-0.5 bg-[#ffcf8a] h-1.5 animate-[pulse_0.9s_infinite]" />
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="hidden sm:inline tracking-wider">AUDIO OFF</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
