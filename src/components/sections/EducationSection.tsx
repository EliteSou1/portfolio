'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { educationData, EducationItem } from '@/data/education';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Award } from 'lucide-react';

export function EducationSection() {
  const { t, language } = usePortfolio();

  return (
    <section
      id="section-education"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="gold" dot>
            {t.education.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
            Formación & <span className="italic text-[#ffcf8a]">Grados</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] font-mono tracking-wider">
            {t.education.subtitle}
          </p>
        </div>

        {/* Scrollable Degree Cards with Edge Fade */}
        <div className="mask-fade-edges space-y-3.5 max-h-[58vh] overflow-y-auto pr-1">
          {educationData.map((item: EducationItem, idx: number) => (
            <AncientCard
              key={item.id}
              accent="gold"
              className="p-5 flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={idx === 0 ? 'gold' : 'stone'} dot={idx === 0}>
                    {item.status[language]}
                  </Badge>
                  <span className="text-xs font-mono text-[#94a3b8]">{item.period}</span>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-[#f1f5f9] leading-snug">
                    {item.degree[language]}
                  </h3>
                  <p className="text-xs font-mono text-[#ffcf8a] mt-1 flex items-center gap-1.5 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-[#ffcf8a]" />
                    <span>{item.institution}</span>
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                  {item.description[language]}
                </p>
              </div>

              {/* Competencies */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-[#ffcf8a]" />
                  Competencias Nucleares
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.specialization[language].map((comp, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#cbd5e1]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </AncientCard>
          ))}
        </div>
      </div>
    </section>
  );
}
