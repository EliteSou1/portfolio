'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { socialData } from '@/data/social';
import { AncientCard } from '@/components/ui/AncientCard';
import { Badge } from '@/components/ui/Badge';
import { Mail, Copy, Check, Send, MapPin } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function ContactSection() {
  const { t } = usePortfolio();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const copied = copyStatus === 'success';
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
  }, []);

  const handleCopyEmail = async () => {
    audioSynth.playSelectTone();
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(socialData.email);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
    resetTimer.current = setTimeout(() => setCopyStatus('idle'), 2500);
  };

  return (
    <section
      id="section-contact"
      data-inner-scroll="true"
      className="w-full max-w-[560px] flex flex-col justify-center py-4 max-h-[78vh] overflow-y-auto mask-fade-edges relative z-10 pr-2"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="gold" dot>
            {t.contact.badge}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#f4efe6] tracking-tight drop-shadow-[0_4px_20px_rgba(5,6,13,0.95)]">
            {t.contact.title}
          </h2>
          <p className="text-sm sm:text-base text-[#ffcf8a] font-mono tracking-wide">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Minimalist Convergence Contact Card */}
        <AncientCard accent="gold" className="p-6 sm:p-7 space-y-6">
          {/* Email Direct Channel with 1-Click Copy */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#a39caa] uppercase tracking-wider block">
              {t.contact.emailLabel}
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded border border-white/10 bg-[#05060d]/70 text-sm font-mono text-[#f4efe6] flex items-center justify-between">
                <span className="truncate">{socialData.email}</span>
                <Mail className="w-4 h-4 text-[#ffcf8a]/70 ml-2 flex-shrink-0" />
              </div>

              <button
                onClick={handleCopyEmail}
                onMouseEnter={() => audioSynth.playHoverTone()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[#ffcf8a]/40 bg-[#ffcf8a]/10 hover:bg-[#ffcf8a]/20 text-[#ffcf8a] text-xs font-mono tracking-wider uppercase transition-colors flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#ffcf8a]" />
                    <span>{t.contact.copySuccess}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#ffcf8a]" />
                    <span>{t.contact.copyPrompt}</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${socialData.email}`}
                onClick={() => audioSynth.playSelectTone()}
                onMouseEnter={() => audioSynth.playHoverTone()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-white/10 bg-[#05060d]/80 hover:bg-white/5 text-[#d0c8d8] hover:text-[#f4efe6] text-xs font-mono tracking-wider uppercase transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-[#ffcf8a]/70" />
                <span>{t.contact.sendEmail}</span>
              </a>
            </div>
          </div>

          <p role="status" aria-live="polite" className="text-xs text-[#ffcf8a]">
            {copyStatus === 'error' ? t.contact.copyError : copied ? t.contact.copySuccess : ''}
          </p>

          {/* Social Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={socialData.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioSynth.playSelectTone()}
              onMouseEnter={() => audioSynth.playHoverTone()}
              className="p-3.5 rounded border border-white/10 bg-[#05060d]/60 hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <GithubIcon className="w-5 h-5 text-[#8b5cf6] group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-[10px] font-mono text-[#a39caa] uppercase block">
                    {t.contact.githubLabel}
                  </span>
                  <span className="text-xs font-mono font-medium text-[#f4efe6]">
                    {socialData.github.replace('https://', '')}
                  </span>
                </div>
              </div>
            </a>

            <a
              href={socialData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioSynth.playSelectTone()}
              onMouseEnter={() => audioSynth.playHoverTone()}
              className="p-3.5 rounded border border-white/10 bg-[#05060d]/60 hover:border-[#ec4899]/50 hover:bg-[#ec4899]/10 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <LinkedinIcon className="w-5 h-5 text-[#ec4899] group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-[10px] font-mono text-[#a39caa] uppercase block">
                    {t.contact.linkedinLabel}
                  </span>
                  <span className="text-xs font-mono font-medium text-[#f4efe6]">
                    linkedin.com/in/saul-rendon
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Location & Coordinates */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs font-mono text-[#a39caa]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#ffcf8a]/70" />
              <span>{socialData.location}</span>
            </div>
            <span className="text-[11px] text-[#7d7387]">{socialData.coordinates}</span>
          </div>
        </AncientCard>

        {/* Minimalist Closing Sign-off */}
        <p className="text-xs sm:text-sm font-sans text-[#a39caa] leading-relaxed border-l-2 border-[#ffcf8a]/40 pl-4 italic">
          {t.contact.closing}
        </p>
      </div>
    </section>
  );
}
