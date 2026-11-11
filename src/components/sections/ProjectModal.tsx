'use client';

import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { X, ArrowRight, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function ProjectModal() {
  const { inspectingProject, setInspectingProject, language, t } = usePortfolio();

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!inspectingProject) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.getElementById('portfolio-shell');
    const wasInert = background?.inert ?? false;
    if (background) background.inert = true;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setInspectingProject(null);
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []).filter(element => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); dialogRef.current?.focus(); return; }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (background) background.inert = wasInert;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [inspectingProject, setInspectingProject]);

  if (!inspectingProject) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={() => setInspectingProject(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#05060d]/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <AncientCard
        accent="gold"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-[#080614]/90 border-white/15 shadow-2xl relative space-y-6 cursor-default mask-fade-edges"
      >
        {/* Close Button */}
        <button
          ref={closeRef}
          onClick={() => {
            audioSynth.playSelectTone();
            setInspectingProject(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-lg border border-white/10 bg-white/5 text-[#a39caa] hover:text-[#ffcf8a] hover:border-[#ffcf8a]/40 transition-colors"
          title={t.projects.closeModal}
          aria-label={t.projects.closeModal}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold" dot>
              {inspectingProject.organization}
            </Badge>
            <Badge variant="stone">{inspectingProject.period}</Badge>
            <span className="text-xs font-mono text-[#a39caa]">
              {inspectingProject.role[language]}
            </span>
          </div>

          <h3 id="modal-title" className="text-2xl sm:text-3xl font-serif text-[#f4efe6]">
            {inspectingProject.title}
          </h3>
          <p className="text-xs sm:text-sm font-mono text-[#ffcf8a] tracking-wide">
            {inspectingProject.subtitle}
          </p>
        </div>

        {/* Metrics Row */}
        {inspectingProject.metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {inspectingProject.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded border border-white/10 bg-[#05060d]/70 flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono text-[#a39caa] uppercase tracking-wider">
                  {m.label[language]}
                </span>
                <span className="text-lg font-mono font-bold text-[#ffcf8a] mt-1">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Challenge & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-white/10 bg-[#05060d]/60 space-y-2">
            <span className="text-xs font-mono text-[#ec4899] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.projects.labels.problem}
            </span>
            <p className="text-xs sm:text-sm text-[#d0c8d8] leading-relaxed">
              {inspectingProject.challenge[language]}
            </p>
          </div>

          <div className="p-4 rounded border border-white/10 bg-[#05060d]/60 space-y-2">
            <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              {t.projects.labels.solution}
            </span>
            <p className="text-xs sm:text-sm text-[#d0c8d8] leading-relaxed">
              {inspectingProject.solution[language]}
            </p>
          </div>
        </div>

        {/* Architecture Topology */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-[#a39caa] uppercase tracking-wider block">
            {t.projects.labels.architecture}
          </span>
          <div className="p-4 rounded border border-white/10 bg-[#05060d]/70 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {inspectingProject.architecture.nodes.map((node, i) => (
                <React.Fragment key={node.id}>
                  <div className="px-3 py-2 rounded border border-white/10 bg-white/5 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider block text-[#a39caa]">
                      {node.type}
                    </span>
                    <span className="text-xs font-mono font-medium text-[#f4efe6]">
                      {node.label}
                    </span>
                  </div>
                  {i < inspectingProject.architecture.nodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#ffcf8a]/60 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono text-[#a39caa] uppercase tracking-wider block">
            {t.projects.labels.highlights}
          </span>
          <ul className="space-y-1.5">
            {inspectingProject.achievements[language].map((ach, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#d0c8d8]">
                <CheckCircle2 className="w-4 h-4 text-[#ffcf8a] flex-shrink-0 mt-0.5" />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack Badges */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-xs font-mono text-[#a39caa] uppercase tracking-wider block">
            {t.projects.labels.stack}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {inspectingProject.stack.map((tech) => (
              <Badge key={tech} variant="stone" className="text-[11px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </AncientCard>
    </div>
  );
}
