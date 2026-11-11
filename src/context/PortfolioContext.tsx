'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import esMessages from '@/locales/es.json';
import enMessages from '@/locales/en.json';
import { ProjectItem } from '@/data/projects';
import { audioSynth } from '@/lib/audio-synth';

export type SectionKey =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'contact';

export const SECTIONS_ORDER: SectionKey[] = [
  'home',
  'about',
  'skills',
  'projects',
  'experience',
  'education',
  'certifications',
  'contact',
];

export interface CoreSectionVisualConfig {
  speed: number;
  particleDensity: number;
  radius: number;
  dispersion: number;
  pulseSpeed: number;
  colorTint: [number, number, number]; // RGB 0-1
  bloomIntensity: number;
}

export const SECTION_CORE_CONFIGS: Record<SectionKey, CoreSectionVisualConfig> = {
  home: {
    speed: 0.6,
    particleDensity: 3200,
    radius: 3.2,
    dispersion: 0.45,
    pulseSpeed: 1.0,
    colorTint: [0.08, 0.45, 0.55], // deep sculk teal
    bloomIntensity: 0.8,
  },
  about: {
    speed: 0.4,
    particleDensity: 2800,
    radius: 3.8, // more open orbits
    dispersion: 0.6,
    pulseSpeed: 0.7,
    colorTint: [0.12, 0.38, 0.48], // ancient stone slate
    bloomIntensity: 0.6,
  },
  skills: {
    speed: 1.3, // faster, organized clusters
    particleDensity: 3600,
    radius: 3.0,
    dispersion: 0.35,
    pulseSpeed: 1.5,
    colorTint: [0.15, 0.65, 0.75], // sharp technical resonance
    bloomIntensity: 1.1,
  },
  projects: {
    speed: 1.5, // dynamic trajectories & orbiting fragments
    particleDensity: 4200,
    radius: 4.2,
    dispersion: 0.75,
    pulseSpeed: 1.8,
    colorTint: [0.1, 0.55, 0.7], // high activity deep cyan
    bloomIntensity: 1.3,
  },
  experience: {
    speed: 0.8, // structured pulses, tech engine
    particleDensity: 3400,
    radius: 3.4,
    dispersion: 0.4,
    pulseSpeed: 1.2,
    colorTint: [0.14, 0.48, 0.62],
    bloomIntensity: 0.9,
  },
  education: {
    speed: 0.5, // ascending, steady calm
    particleDensity: 2900,
    radius: 3.1,
    dispersion: 0.3,
    pulseSpeed: 0.8,
    colorTint: [0.18, 0.52, 0.58],
    bloomIntensity: 0.7,
  },
  certifications: {
    speed: 0.9, // clusters fading & appearing
    particleDensity: 3100,
    radius: 3.3,
    dispersion: 0.5,
    pulseSpeed: 1.1,
    colorTint: [0.2, 0.6, 0.68],
    bloomIntensity: 0.85,
  },
  contact: {
    speed: 1.8, // particles converging inward towards core
    particleDensity: 4000,
    radius: 2.5, // compressed core
    dispersion: 0.2,
    pulseSpeed: 2.2,
    colorTint: [0.08, 0.7, 0.82], // intense convergence
    bloomIntensity: 1.4,
  },
};

interface PortfolioContextType {
  activeSection: SectionKey;
  sectionIndex: number;
  scrollProgress: number;
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  t: typeof esMessages;
  audioActive: boolean;
  toggleAudio: () => void;
  isReducedMotion: boolean;
  isMobile: boolean;
  inspectingProject: ProjectItem | null;
  setInspectingProject: (proj: ProjectItem | null) => void;
  navigateToSection: (section: SectionKey, direction?: 'forward' | 'backward') => void;
  nextSection: () => void;
  prevSection: () => void;
  transitionDirection: 'forward' | 'backward';
  isTransitioning: boolean;
  orbitalAngle: number;
  coreConfig: CoreSectionVisualConfig;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [sectionIndex, setSectionIndex] = useState<number>(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [language, setLanguageState] = useState<'es' | 'en'>('es');
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [inspectingProject, setInspectingProject] = useState<ProjectItem | null>(null);

  const transitionCooldownRef = useRef<boolean>(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read browser preferences for reduced motion and mobile screen width
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQueryMotion.matches);

    const mediaQueryMobile = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQueryMobile.matches);
    const onMobileChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQueryMobile.addEventListener('change', onMobileChange);

    const onMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQueryMotion.addEventListener('change', onMotionChange);

    let savedLang: string | null = null;
    try { savedLang = localStorage.getItem('portfolio_lang'); } catch { /* Storage can be disabled. */ }
    if (savedLang === 'es' || savedLang === 'en') {
      setLanguageState(savedLang);
    } else if (navigator.language.startsWith('es')) {
      setLanguageState('es');
    } else {
      setLanguageState('en');
    }

    return () => {
      mediaQueryMobile.removeEventListener('change', onMobileChange);
      mediaQueryMotion.removeEventListener('change', onMotionChange);
    };
  }, []);

  const setLanguage = (lang: 'es' | 'en') => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('portfolio_lang', lang); } catch { /* Keep language changes usable without storage. */ }
    }
  };

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => () => {
    if (transitionTimerRef.current !== null) clearTimeout(transitionTimerRef.current);
  }, []);

  const toggleAudio = useCallback(async () => {
    const isNowActive = await audioSynth.toggle();
    setAudioActive(isNowActive);
  }, []);

  const navigateToSection = useCallback(
    (targetSection: SectionKey, forcedDirection?: 'forward' | 'backward') => {
      if (transitionCooldownRef.current) return;

      const currentIndex = SECTIONS_ORDER.indexOf(activeSection);
      const targetIndex = SECTIONS_ORDER.indexOf(targetSection);
      if (targetIndex === currentIndex) return;

      transitionCooldownRef.current = true;
      setIsTransitioning(true);

      const direction =
        forcedDirection || (targetIndex > currentIndex ? 'forward' : 'backward');
      setTransitionDirection(direction);
      setActiveSection(targetSection);
      setSectionIndex(targetIndex);

      audioSynth.playSectionTransition(targetIndex);

      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        transitionCooldownRef.current = false;
      }, isReducedMotion ? 0 : 550);
    },
    [activeSection, isReducedMotion]
  );

  const nextSection = useCallback(() => {
    const currentIdx = SECTIONS_ORDER.indexOf(activeSection);
    const nextIdx = (currentIdx + 1) % SECTIONS_ORDER.length;
    navigateToSection(SECTIONS_ORDER[nextIdx], 'forward');
  }, [activeSection, navigateToSection]);

  const prevSection = useCallback(() => {
    const currentIdx = SECTIONS_ORDER.indexOf(activeSection);
    const prevIdx = (currentIdx - 1 + SECTIONS_ORDER.length) % SECTIONS_ORDER.length;
    navigateToSection(SECTIONS_ORDER[prevIdx], 'backward');
  }, [activeSection, navigateToSection]);

  // Orbital angle around the central core: 8 sections = 45 degrees (PI / 4) per section
  const orbitalAngle = sectionIndex * ((Math.PI * 2) / SECTIONS_ORDER.length);
  const scrollProgress = sectionIndex / (SECTIONS_ORDER.length - 1);
  const coreConfig = SECTION_CORE_CONFIGS[activeSection];
  const t = language === 'es' ? esMessages : enMessages;

  return (
    <PortfolioContext.Provider
      value={{
        activeSection,
        sectionIndex,
        scrollProgress,
        language,
        setLanguage,
        t,
        audioActive,
        toggleAudio,
        isReducedMotion,
        isMobile,
        inspectingProject,
        setInspectingProject,
        navigateToSection,
        nextSection,
        prevSection,
        transitionDirection,
        isTransitioning,
        orbitalAngle,
        coreConfig,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return ctx;
}
