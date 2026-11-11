'use client';

import React from 'react';
import { usePortfolio, SECTIONS_ORDER, SectionKey } from '@/context/PortfolioContext';
import { audioSynth } from '@/lib/audio-synth';

export function OrbitalNav() {
  const { activeSection, navigateToSection, t } = usePortfolio();

  return (
    <nav
      aria-label={t.nav.navigation}
      className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-end gap-3 select-none pointer-events-auto"
    >
      <div
        style={{
          backgroundColor: 'rgba(8, 6, 20, 0.55)',
          backdropFilter: 'blur(10px)',
        }}
        className="flex flex-col items-end gap-2.5 py-3 px-2 rounded-full border border-white/10 shadow-xl"
      >
        {SECTIONS_ORDER.map((section, idx) => {
          const isActive = activeSection === section;
          const sectionLabel = t.nav[section] || section;

          return (
            <button
              key={section}
              onClick={() => {
                navigateToSection(section as SectionKey);
              }}
              onMouseEnter={() => audioSynth.playHoverTone()}
              className="group relative flex items-center justify-end min-w-6 min-h-6"
              aria-label={sectionLabel}
              aria-current={isActive ? 'location' : undefined}
            >
              {/* Tooltip Label flying to the left on hover */}
              <span
                style={{
                  backgroundColor: 'rgba(8, 6, 20, 0.75)',
                  backdropFilter: 'blur(10px)',
                }}
                className={`absolute right-7 px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-200 pointer-events-none border ${
                  isActive
                    ? 'opacity-100 translate-x-0 border-[#ffcf8a]/40 text-[#ffcf8a]'
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 border-white/10 text-[#94a3b8]'
                }`}
              >
                <span className="text-[#ffcf8a] mr-1.5 font-bold">0{idx + 1}</span>
                {sectionLabel}
              </span>

              {/* Orbital Navigation Point */}
              <div
                className={`relative flex items-center justify-center transition-all duration-200 rounded-full ${
                  isActive
                    ? 'w-4 h-4 border border-[#ffcf8a] shadow-[0_0_10px_rgba(255,207,138,0.4)]'
                    : 'w-2.5 h-2.5 border border-white/20 group-hover:border-[#ffcf8a]/50'
                }`}
              >
                <span
                  className={`rounded-full transition-all duration-200 ${
                    isActive ? 'w-1.5 h-1.5 bg-[#ffcf8a]' : 'w-1 h-1 bg-white/30 group-hover:bg-[#ffcf8a]/60'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
