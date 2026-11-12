'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { Layers, Cpu, Server, Network } from 'lucide-react';

export function AboutSection() {
  const { t } = usePortfolio();
  const iconMap = [Layers, Cpu, Server, Network];

  return (
    <section
      id="section-about"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      <div className="space-y-4">
        {/* Section Header */}
        <div className="space-y-2">
          <Badge variant="gold" dot>
            {t.about.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-sm font-mono text-[#ffcf8a] leading-relaxed">
            {t.about.lead}
          </p>
        </div>

        {/* Scrollable Narrative Cards with Edge Fade */}
        <div className="mask-fade-edges space-y-3 max-h-[58vh] overflow-y-auto pr-1">
          <AncientCard accent="blue" className="p-5 space-y-2">
            <div className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              {t.about.genesis}
            </div>
            <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
              {t.about.p1}
            </p>
          </AncientCard>

          <AncientCard accent="violet" className="p-5 space-y-2">
            <div className="text-xs font-mono text-[#c084fc] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              {t.about.philosophy}
            </div>
            <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
              {t.about.p2}
            </p>
          </AncientCard>

          {/* Highlights in 2x2 grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {t.about.highlights.map((item: { label: string; value: string }, idx: number) => {
              const Icon = iconMap[idx % iconMap.length];
              return (
                <AncientCard
                  key={idx}
                  accent="gold"
                  variant="interactive"
                  className="p-3.5 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">
                      {item.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-[#ffcf8a]" />
                  </div>
                  <div className="text-xs font-semibold text-[#f1f5f9]">
                    {item.value}
                  </div>
                </AncientCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
