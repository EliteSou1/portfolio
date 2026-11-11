'use client';

import React from 'react';
import { usePortfolio, SECTIONS_ORDER, SectionKey } from '@/context/PortfolioContext';
import { ChevronDown } from 'lucide-react';

export function ProgressIndicator() {
  const { activeSection, sectionIndex, t, navigateToSection } = usePortfolio();
  const total = SECTIONS_ORDER.length;

  const nextSection = sectionIndex < total - 1 ? SECTIONS_ORDER[sectionIndex + 1] : null;

  return (
    <>
      {/* Desktop HUD Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-5 py-3 md:px-8 md:py-4 flex items-center justify-between text-xs font-mono text-[#527786] pointer-events-none select-none">
        {/* Coordinates */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[#1ad1d7]/60">COORD:</span>
          <span>{t.home.coordinates}</span>
        </div>

        {/* Center: Next Section / Scroll indicator */}
        <div className="flex items-center justify-center flex-1 md:flex-none">
          {nextSection ? (
            <button
              onClick={() => navigateToSection(nextSection as SectionKey)}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded border border-[#162732] bg-[#070e14]/70 backdrop-blur text-[11px] text-[#789ca9] hover:text-[#3ce8f3] hover:border-[#1ad1d7]/40 transition-colors group"
            >
              <span className="tracking-wider uppercase">
                {t.home.scrollHint.split(' ')[0]} // {t.nav[nextSection]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#1ad1d7] group-hover:translate-y-0.5 transition-transform" />
            </button>
          ) : (
            <span className="text-[11px] text-[#4d7180] uppercase tracking-wider">
              {t.nav.status}: {t.nav.contact}
            </span>
          )}
        </div>

        {/* Right: Numerical Orbit Index & Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="tracking-widest">
            <span className="text-[#1ad1d7] font-semibold">0{sectionIndex + 1}</span>
            <span className="text-[#2c4452]"> / 0{total}</span>
          </span>
          {/* Micro Progress Track */}
          <div className="w-16 h-1 bg-[#101b22] rounded-full overflow-hidden border border-[#1a2c36]">
            <div
              className="h-full bg-gradient-to-r from-[#1ad1d7] to-[#45e8f4] transition-all duration-500 rounded-full"
              style={{ width: `${((sectionIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </footer>

      {/* Mobile Horizontal Quick Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#070d13]/90 border border-[#1a2d39] backdrop-blur-lg shadow-xl"
      >
        {SECTIONS_ORDER.map((sec, idx) => {
          const isActive = activeSection === sec;
          return (
            <button
              key={sec}
              onClick={() => navigateToSection(sec as SectionKey)}
              className={`px-2 py-1 rounded-full text-[10px] font-mono transition-all ${
                isActive
                  ? 'bg-[#14343f] text-[#3ce8f3] font-bold border border-[#1ad1d7]/40'
                  : 'text-[#618594] hover:text-[#9fc1cd]'
              }`}
            >
              0{idx + 1}
            </button>
          );
        })}
      </nav>
    </>
  );
}
