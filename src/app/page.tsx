'use client';

import React, { useEffect, useRef } from 'react';
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
    isReducedMotion,
    t,
  } = usePortfolio();

  const stageRef = useRef<HTMLDivElement>(null);
  const previousSection = useRef(activeSection);
  useEffect(() => {
    if (previousSection.current !== activeSection) {
      stageRef.current?.focus({ preventScroll: true });
      previousSection.current = activeSection;
    }
  }, [activeSection]);

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
      className="fixed inset-0 w-screen h-dvh overflow-hidden bg-[#05060d] text-[#f4efe6]"
    >
      <div id="portfolio-shell">
        {/* 1. Cinematic 3D Universe Canvas with Galaxy & Deep Space Vault */}
        <UniverseCanvas />

        {/* 2. Scroll and Gesture Orbit Snapping Engine */}
        <ScrollController />

        {/* 3. Refined Minimal HUD (ES/EN, Audio, Lateral Progress) */}
        <HeaderHUD />
        <OrbitalNav />

        {/* 4. Floating Orbital Controls (Bottom-left Desktop, art-directed in gold/violet) */}
        <div className="fixed left-4 md:left-8 bottom-4 sm:bottom-8 z-30 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              audioSynth.playSelectTone();
              prevSection();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#080614]/70 hover:border-[#ffcf8a]/40 hover:bg-[#ffcf8a]/10 text-[#a39caa] hover:text-[#ffcf8a] text-[11px] font-mono tracking-wider transition-all backdrop-blur-md"
            title={t.nav.previous}
            aria-label={t.nav.previous}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#ffcf8a]" />
            <span>{t.nav.previous}</span>
          </button>

          <button
            onClick={() => {
              audioSynth.playSelectTone();
              nextSection();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#ffcf8a]/40 bg-[#ffcf8a]/10 hover:border-[#ffcf8a] hover:bg-[#ffcf8a]/20 text-[#ffcf8a] text-[11px] font-mono tracking-wider transition-all backdrop-blur-md shadow-[0_0_15px_rgba(255,207,138,0.15)]"
            title={t.nav.next}
            aria-label={t.nav.next}
          >
            <span>{t.nav.next}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#ffcf8a]" />
          </button>
        </div>

        {/* 5. Orbital Stage: Stable Left Column Layout (calm, predictable reading framing) */}
        <div className="fixed inset-0 z-20 flex items-center justify-center lg:justify-start p-4 sm:p-8 pt-20 pb-16 lg:pl-16 xl:pl-28 pointer-events-none">
          <div
            ref={stageRef}
            tabIndex={-1}
            role="region"
            aria-label={t.nav[activeSection]}
            key={activeSection}
            className={`w-full max-w-[580px] max-h-full overflow-y-auto pointer-events-auto reading-column-backdrop p-2 sm:p-4 rounded-2xl transition-all duration-300 ease-out ${
              isTransitioning && !isReducedMotion
                ? transitionDirection === 'forward'
                  ? 'opacity-0 translate-y-2'
                  : 'opacity-0 -translate-y-2'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {renderActiveSection()}
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{t.nav[activeSection]}</p>
      </div>

      {/* 6. Interactive Project Case Study Inspection Modal */}
      <ProjectModal />

      {/* 7. Deep Space Scrubber & Telemetry HUD (?debug=1 only) */}
      <DebugPanel />
    </main>
  );
}
