'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { skillsCategories, SkillItem, SkillCategory } from '@/data/skills';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { Layout, Server, Smartphone, Database, Terminal, Workflow, LucideIcon } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function SkillsSection() {
  const { t, language } = usePortfolio();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('frontend');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const categoryIcons: Record<string, LucideIcon> = {
    frontend: Layout,
    backend: Server,
    mobile: Smartphone,
    databases: Database,
    infrastructure: Terminal,
    other: Workflow,
  };

  const currentCategory: SkillCategory =
    skillsCategories.find((c) => c.id === activeCategoryId) || skillsCategories[0];

  return (
    <section
      id="section-skills"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      <div className="space-y-4">
        {/* Section Header */}
        <div className="space-y-2">
          <Badge variant="magenta" dot>
            {t.skills.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
            {t.skills.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] font-mono tracking-wider">
            {t.skills.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
          {skillsCategories.map((cat) => {
            const IconComponent = categoryIcons[cat.id] || Layout;
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  audioSynth.playSelectTone();
                  setActiveCategoryId(cat.id);
                  setSelectedSkill(null);
                }}
                onMouseEnter={() => audioSynth.playHoverTone()}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono tracking-wider transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/40 font-semibold'
                    : 'bg-white/5 text-[#94a3b8] hover:text-[#f1f5f9] border border-white/10'
                }`}
              >
                <IconComponent className={`w-3 h-3 ${isActive ? 'text-[#ec4899]' : 'text-[#94a3b8]'}`} />
                <span>{cat.title[language]}</span>
              </button>
            );
          })}
        </div>

        {/* Skills List in Scroll Container with Edge Fade */}
        <div className="mask-fade-edges space-y-2 max-h-[58vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            {currentCategory.skills.map((skill: SkillItem) => {
              const isSelected = selectedSkill?.name === skill.name;
              return (
                <AncientCard
                  key={skill.name}
                  variant="interactive"
                  role="button"
                  tabIndex={0}
                  accent="magenta"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      audioSynth.playSelectTone();
                      setSelectedSkill(isSelected ? null : skill);
                    }
                  }}
                  onClick={() => {
                    audioSynth.playSelectTone();
                    setSelectedSkill(isSelected ? null : skill);
                  }}
                  className={`p-3 space-y-1.5 transition-all duration-200 ${
                    isSelected ? 'border-[#ec4899] bg-[#ec4899]/15' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f1f5f9]">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffcf8a]">
                      {skill.proficiency}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#94a3b8] font-sans line-clamp-1">
                    {skill.context[language]}
                  </p>
                </AncientCard>
              );
            })}
          </div>

          {/* Selected Skill Detail Note */}
          {selectedSkill && (
            <AncientCard accent="gold" className="p-4 mt-2 border-[#ffcf8a]/30">
              <div className="flex items-center justify-between text-xs font-mono text-[#ffcf8a] mb-1 font-semibold">
                <span>{selectedSkill.name}</span>
                <span className="uppercase">{selectedSkill.proficiency}</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {selectedSkill.context[language]}
              </p>
            </AncientCard>
          )}
        </div>
      </div>
    </section>
  );
}
