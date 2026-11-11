'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { projectsData, ProjectItem } from '@/data/projects';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function ProjectsSection() {
  const { t, language, setInspectingProject } = usePortfolio();
  const [filter, setFilter] = useState<'all' | 'enterprise' | 'mobile' | 'infrastructure'>('all');

  const filteredProjects = projectsData.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  return (
    <section
      id="section-projects"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      {/* Header */}
      <div className="space-y-2 mb-4">
        <Badge variant="gold" dot>
          {t.projects.badge}
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
          Sistemas & <span className="italic text-[#ffcf8a]">Arquitecturas</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#94a3b8] font-mono tracking-wider">
          {t.projects.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-3 mb-2 border-b border-white/10">
        {[
          { id: 'all', label: language === 'es' ? 'Todos' : 'All' },
          { id: 'enterprise', label: language === 'es' ? 'Empresariales' : 'Enterprise' },
          { id: 'mobile', label: language === 'es' ? 'Móvil & PWA' : 'Mobile & PWA' },
          { id: 'infrastructure', label: language === 'es' ? 'Infraestructura' : 'Infra' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              audioSynth.playSelectTone();
              setFilter(item.id as typeof filter);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono tracking-wider transition-colors duration-200 ${
              filter === item.id
                ? 'bg-[#ffcf8a]/15 text-[#ffcf8a] border border-[#ffcf8a]/40 font-semibold'
                : 'bg-white/5 text-[#94a3b8] hover:text-[#f1f5f9] border border-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Compact Scroll-Snap Cards List with Smooth Edge Fade */}
      <div className="mask-fade-edges scroll-snap-y space-y-3.5 max-h-[58vh] sm:max-h-[62vh] overflow-y-auto pr-1">
        {filteredProjects.map((project: ProjectItem) => (
          <div key={project.id} className="scroll-snap-align-start pt-1">
            <AncientCard
              variant="interactive"
              accent="blue"
              onClick={() => {
                audioSynth.playSelectTone();
                setInspectingProject(project);
              }}
              className="p-5 flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                {/* Meta Top Line */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#38bdf8] tracking-widest uppercase font-medium">
                    {project.organization}
                  </span>
                  <span className="text-[#94a3b8]">{project.period}</span>
                </div>

                {/* Title in Serif */}
                <h3 className="text-xl sm:text-2xl font-serif text-[#f1f5f9] group-hover:text-[#ffcf8a] transition-colors flex items-center justify-between">
                  <span>{project.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#ffcf8a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </h3>

                {/* Subtitle */}
                <p className="text-xs font-mono text-[#94a3b8] line-clamp-1">
                  {project.subtitle}
                </p>

                {/* Summary (Max 3 lines, high contrast text) */}
                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed line-clamp-3">
                  {project.summary[language]}
                </p>
              </div>

              {/* Bottom Tags & Inspect CTA */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-white/5 border border-white/10 text-[#94a3b8]"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.stack.length > 3 && (
                    <span className="text-[10px] font-mono text-[#94a3b8] self-center">
                      +{project.stack.length - 3}
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-[#ffcf8a] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>Inspeccionar</span>
                  <span>→</span>
                </span>
              </div>
            </AncientCard>
          </div>
        ))}
      </div>
    </section>
  );
}
