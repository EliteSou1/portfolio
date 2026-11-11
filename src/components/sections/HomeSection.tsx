'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Compass, Terminal, Shield, ArrowDown } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function HomeSection() {
  const { t, navigateToSection } = usePortfolio();

  return (
    <section
      id="section-home"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center items-start max-w-[560px] relative z-10"
    >
      <div className="space-y-5">
        {/* Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold" dot>
            {t.nav.status} // ORBIT 00
          </Badge>
          <Badge variant="stone">
            DEEP SPACE ARCHITECTURE
          </Badge>
        </div>

        {/* Title / Name in Instrument Serif */}
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-[0.25em] text-[#ffcf8a] uppercase">
            {t.home.role}
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-[#f1f5f9] leading-[1.05]">
            {t.home.title}{' '}
            <span className="italic text-[#ffcf8a]">
              {t.home.surname}
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-mono tracking-widest text-[#94a3b8] flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#ffcf8a]" />
          <span>{t.home.subtitle}</span>
        </p>

        {/* Narrative Excerpt in Translucent Card */}
        <AncientCard accent="gold" className="p-5 sm:p-6 leading-relaxed text-sm sm:text-base text-[#cbd5e1] font-sans">
          <p>{t.home.description}</p>
        </AncientCard>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              audioSynth.playSelectTone();
              navigateToSection('projects');
            }}
            onMouseEnter={() => audioSynth.playHoverTone()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ffcf8a] hover:bg-[#ffe0ad] text-[#05060d] font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(255,207,138,0.3)]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.home.ctaProjects}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              audioSynth.playSelectTone();
              navigateToSection('experience');
            }}
            onMouseEnter={() => audioSynth.playHoverTone()}
            style={{
              backgroundColor: 'rgba(8, 6, 20, 0.65)',
              backdropFilter: 'blur(10px)',
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-[#ec4899]/60 text-[#f1f5f9] hover:text-[#ec4899] font-mono text-xs uppercase tracking-wider transition-all duration-200"
          >
            <Shield className="w-3.5 h-3.5 text-[#ec4899]" />
            <span>{t.home.ctaExperience}</span>
          </button>

          <button
            onClick={() => {
              audioSynth.playSelectTone();
              navigateToSection('contact');
            }}
            onMouseEnter={() => audioSynth.playHoverTone()}
            style={{
              backgroundColor: 'rgba(8, 6, 20, 0.65)',
              backdropFilter: 'blur(10px)',
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-[#8b5cf6]/60 text-[#94a3b8] hover:text-[#c084fc] font-mono text-xs uppercase tracking-wider transition-all duration-200"
          >
            <span>{t.home.ctaContact}</span>
          </button>
        </div>

        {/* Soft Hero Scroll Hint */}
        <div className="flex items-center gap-2 pt-3 text-[11px] font-mono text-[#94a3b8]/70">
          <ArrowDown className="w-3 h-3 text-[#ffcf8a] animate-bounce" />
          <span className="tracking-widest uppercase">Desplaza para navegar el cosmos</span>
        </div>
      </div>
    </section>
  );
}
