'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { experienceData, ExperienceItem } from '@/data/experience';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';

export function ExperienceSection() {
  const { t, language } = usePortfolio();

  return (
    <section
      id="section-experience"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="gold" dot>
            {t.experience.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
            {t.experience.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] font-mono tracking-wider">
            {t.experience.subtitle}
          </p>
        </div>

        {/* Scrollable Timeline with Edge Fade */}
        <div className="mask-fade-edges space-y-4 max-h-[58vh] overflow-y-auto pr-1 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-white/10">
          {experienceData.map((item: ExperienceItem) => (
            <div key={item.id} className="relative pl-7">
              {/* Timeline dot */}
              <div className="absolute left-1 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-[#ffcf8a] bg-[#05060d] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffcf8a]" />
              </div>

              <AncientCard accent="gold" className="p-4 sm:p-5 space-y-2.5">
                {/* Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-2">
                  <div>
                    <span className="text-xs font-mono text-[#ffcf8a] uppercase tracking-wider block font-semibold">
                      {item.company}
                    </span>
                    <h3 className="text-lg font-serif text-[#f1f5f9]">
                      {item.role[language]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#94a3b8]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#ffcf8a]" />
                      {item.period}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                  {item.summary[language]}
                </p>

                {/* Responsibilities List */}
                <ul className="space-y-1 pt-1 text-xs text-[#cbd5e1]">
                  {item.responsibilities[language].slice(0, 3).map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#ffcf8a] shrink-0 mt-0.5" />
                      <span className="leading-snug">{ach}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1 pt-2">
                  {item.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-white/5 border border-white/10 text-[#94a3b8]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </AncientCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
