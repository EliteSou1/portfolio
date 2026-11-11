'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePortfolio } from '@/context/PortfolioContext';
import { HeaderHUD } from '@/components/navigation/HeaderHUD';
import { OrbitalNav } from '@/components/navigation/OrbitalNav';
import { ScrollController } from '@/components/scene/ScrollController';
import { HomeSection } from '@/components/sections/HomeSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ProjectModal } from '@/components/sections/ProjectModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';
import { DebugPanel } from '@/components/ui/DebugPanel';

// Dynamically import UniverseCanvas to avoid SSR issues with Three.js WebGL context
const UniverseCanvas = dynamic(
  () => import('@/components/scene/UniverseCanvas').then((mod) => mod.UniverseCanvas),
  { ssr: false }
);

export default function Home() {
  const {
    activeSection,
    sectionIndex,
    nextSection,
    prevSection,
    transitionDirection,
    isTransitioning,
  } = usePortfolio();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'about':
        return <AboutSection />;
      case 'skills':
        return <SkillsSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'education':
        return <EducationSection />;
      case 'certifications':
        return <CertificationsSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <HomeSection />;
    }
  };

  // Alterna el lado por sección (izq, der, izq...) para dar ritmo y dejar libre el espacio profundo
  const isLeftSide = sectionIndex % 2 === 0;

  return (
    <main
      translate="no"
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#05060d] text-[#f4efe6] select-none"
    >
      {/* 1. Cinematic 3D Universe Canvas with Galaxy & Deep Space Vault */}
      <UniverseCanvas />

      {/* 2. Scroll and Gesture Orbit Snapping Engine */}
      <ScrollController />

      {/* 3. Refined Minimal HUD (ES/EN, Audio, Lateral Progress) */}
      <HeaderHUD />
      <OrbitalNav />

      {/* 4. Floating Orbital Controls (Bottom-left Desktop, art-directed in gold/violet) */}
      <div className="fixed left-6 md:left-8 bottom-8 z-30 hidden sm:flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            audioSynth.playSelectTone();
            prevSection();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#080614]/70 hover:border-[#ffcf8a]/40 hover:bg-[#ffcf8a]/10 text-[#a39caa] hover:text-[#ffcf8a] text-[11px] font-mono tracking-wider transition-all backdrop-blur-md"
          title="Sección anterior (← o rueda arriba)"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#ffcf8a]" />
          <span className="hidden md:inline">ANTERIOR</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playSelectTone();
            nextSection();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#ffcf8a]/40 bg-[#ffcf8a]/10 hover:border-[#ffcf8a] hover:bg-[#ffcf8a]/20 text-[#ffcf8a] text-[11px] font-mono tracking-wider transition-all backdrop-blur-md shadow-[0_0_15px_rgba(255,207,138,0.15)]"
          title="Siguiente sección (→ o rueda abajo)"
        >
          <span className="hidden md:inline">SIGUIENTE</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#ffcf8a]" />
        </button>
      </div>

      {/* 5. Orbital Stage: Alternating Left/Right layout (max-w 560px, ~45-50% width on desktop) */}
      <div
        className={`fixed inset-0 z-20 flex items-center p-4 sm:p-8 pt-20 pb-16 pointer-events-none transition-all duration-700 ${
          isLeftSide
            ? 'justify-center lg:justify-start lg:pl-16 xl:pl-28'
            : 'justify-center lg:justify-end lg:pr-16 xl:pr-28'
        }`}
      >
        <div
          key={activeSection}
          className={`w-full max-w-[560px] transition-all duration-500 ease-out pointer-events-auto ${
            isTransitioning
              ? transitionDirection === 'forward'
                ? 'opacity-0 translate-y-4 scale-[0.98] blur-[2px]'
                : 'opacity-0 -translate-y-4 scale-[0.98] blur-[2px]'
              : 'opacity-100 translate-y-0 scale-100 blur-0'
          }`}
        >
          {renderActiveSection()}
        </div>
      </div>

      {/* 6. Interactive Project Case Study Inspection Modal */}
      <ProjectModal />

      {/* 7. Deep Space Scrubber & Telemetry HUD (?debug=1 only) */}
      <DebugPanel />
    </main>
  );
}
