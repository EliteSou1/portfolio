import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { sceneBridge } from '@/components/scene/sceneBridge';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function initScrollAndAnimations() {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Limpieza rigurosa de instancias previas para evitar stale closures en transiciones SPA
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  // 2. Lenis Smooth Scroll (solo si no hay reduced motion)
  if (!prefersReduced) {
    if (!lenisInstance) {
      lenisInstance = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      gsap.ticker.add((time) => {
        lenisInstance?.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 3. ScrollTrigger Maestro Global: Progreso continuo para rotación multi-eje del universo 3D
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      if (!prefersReduced) {
        sceneBridge.setScrollProgress(self.progress);
      }
    },
  });

  // 4. Estados narrativos por sección en el Universo 3D
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    ScrollTrigger.create({
      trigger: heroEl,
      start: 'top top',
      end: 'bottom 40%',
      onEnter: () => sceneBridge.setState({ section: 'HERO', dispersion: 1.0, clusterCount: 0, density: 0.35 }),
      onEnterBack: () => sceneBridge.setState({ section: 'HERO', dispersion: 1.0, clusterCount: 0, density: 0.35 }),
    });
  }

  const overviewEl = document.getElementById('overview');
  if (overviewEl) {
    ScrollTrigger.create({
      trigger: overviewEl,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () =>
        sceneBridge.setState({
          section: 'OVERVIEW',
          dispersion: 0.45,
          clusterCount: 4,
          density: 0.75,
          accentOverride: undefined,
        }),
      onEnterBack: () =>
        sceneBridge.setState({
          section: 'OVERVIEW',
          dispersion: 0.45,
          clusterCount: 4,
          density: 0.75,
          accentOverride: undefined,
        }),
    });
  }

  // 5. Casos de Estudio en Scroll Vertical: Activan el planeta en órbita correspondiente
  const caseCards = document.querySelectorAll<HTMLElement>('.project-case-study');
  caseCards.forEach((card, index) => {
    const slug = card.dataset.projectSlug;
    if (!slug) return;

    ScrollTrigger.create({
      trigger: card,
      start: 'top 65%',
      end: 'bottom 35%',
      onEnter: () => sceneBridge.setActiveProject(slug, index),
      onEnterBack: () => sceneBridge.setActiveProject(slug, index),
    });
  });

  // 6. Contacto: Convergencia hacia el núcleo estelar cálido ámbar
  const contactEl = document.getElementById('contacto');
  if (contactEl) {
    ScrollTrigger.create({
      trigger: contactEl,
      start: 'top 65%',
      end: 'bottom bottom',
      onEnter: () =>
        sceneBridge.setState({
          section: 'CONTACT',
          dispersion: 0.08,
          clusterCount: 1,
          density: 0.85,
          accentOverride: '#b8874a',
        }),
      onEnterBack: () =>
        sceneBridge.setState({
          section: 'CONTACT',
          dispersion: 0.08,
          clusterCount: 1,
          density: 0.85,
          accentOverride: '#b8874a',
        }),
    });
  }

  // 7. Transición de Secciones v3: Fade + Slide Horizontal Alternado (Izquierda / Derecha)
  // Cada sección o bloque principal entra alternando su origen (40-60px), 400-600ms, power2.out
  const flowBlocks: Array<{ el: HTMLElement | null; fromLeft: boolean }> = [
    { el: document.querySelector('#hero .max-w-6xl'), fromLeft: true },           // 1. Hero: izquierda
    { el: document.querySelector('#overview .max-w-6xl'), fromLeft: false },       // 2. Overview: derecha
    // 3 - 7. Cada proyecto de estudio de caso alternando
    ...Array.from(caseCards).map((card, i) => ({ el: card, fromLeft: i % 2 === 0 })),
    { el: document.querySelector('#skills .max-w-6xl'), fromLeft: false },         // 8. Skills: derecha
    { el: document.querySelector('#educacion .max-w-6xl'), fromLeft: true },       // 9. Educación: izquierda
    { el: document.querySelector('#contacto .max-w-4xl'), fromLeft: false },       // 10. Contacto: derecha
  ];

  flowBlocks.forEach(({ el, fromLeft }) => {
    if (!el) return;

    if (prefersReduced) {
      // Accesibilidad: sólo fade de opacidad, sin desplazamiento horizontal
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    } else {
      const offsetX = fromLeft ? -50 : 50;

      gsap.fromTo(
        el,
        { opacity: 0, x: offsetX },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cascada de Badges de tecnología (stagger de 40-50ms)
      const badges = el.querySelectorAll('.tech-badge');
      if (badges.length > 0) {
        gsap.fromTo(
          badges,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.045,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }
  });

  ScrollTrigger.refresh();
}

export function cleanupScroll() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

