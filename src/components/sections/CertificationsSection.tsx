'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { certificationsData, CertificationItem } from '@/data/certifications';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { Award, ExternalLink, KeyRound } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

export function CertificationsSection() {
  const { t } = usePortfolio();

  return (
    <section
      id="section-certifications"
      data-inner-scroll="true"
      className="w-full flex flex-col justify-center max-w-[560px] relative z-10"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="violet" dot>
            {t.certifications.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f1f5f9] tracking-tight">
            Credenciales & <span className="italic text-[#c084fc]">Certificaciones</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] font-mono tracking-wider">
            {t.certifications.subtitle}
          </p>
        </div>

        {/* Scrollable Certifications List with Edge Fade */}
        <div className="mask-fade-edges space-y-3 max-h-[58vh] overflow-y-auto pr-1">
          {certificationsData.map((cert: CertificationItem) => (
            <AncientCard
              key={cert.id}
              variant="interactive"
              accent="violet"
              className="p-4 flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
                  <span className="flex items-center gap-1.5 text-[#c084fc] font-semibold">
                    <Award className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    {cert.issuer}
                  </span>
                  <span>{cert.issueDate}</span>
                </div>

                <h3 className="text-lg font-serif text-[#f1f5f9] leading-snug">
                  {cert.name}
                </h3>

                {cert.credentialId && (
                  <div className="text-[10px] font-mono text-[#94a3b8] flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-[#8b5cf6]" />
                    <span>ID: {cert.credentialId}</span>
                  </div>
                )}
              </div>

              {/* Skills and URL */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {cert.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#cbd5e1]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => audioSynth.playSelectTone()}
                    className="flex items-center gap-1 text-xs font-mono text-[#ffcf8a] hover:underline"
                  >
                    <span>Verificar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </AncientCard>
          ))}
        </div>
      </div>
    </section>
  );
}
