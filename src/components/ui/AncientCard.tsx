'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { audioSynth } from '@/lib/audio-synth';

export type CardAccent = 'gold' | 'magenta' | 'violet' | 'blue' | 'neutral';

interface AncientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  accent?: CardAccent;
}

export function AncientCard({
  children,
  className,
  variant = 'default',
  accent = 'gold',
  onMouseEnter,
  ...props
}: AncientCardProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant === 'interactive') {
      audioSynth.playHoverTone();
    }
    if (onMouseEnter) onMouseEnter(e);
  };

  const hoverBorderColor = {
    gold: 'hover:border-[#ffcf8a]/60',
    magenta: 'hover:border-[#ec4899]/60',
    violet: 'hover:border-[#8b5cf6]/60',
    blue: 'hover:border-[#38bdf8]/60',
    neutral: 'hover:border-white/30',
  }[accent];

  const cornerTickColor = {
    gold: 'border-[#ffcf8a]/40',
    magenta: 'border-[#ec4899]/40',
    violet: 'border-[#8b5cf6]/40',
    blue: 'border-[#38bdf8]/40',
    neutral: 'border-white/20',
  }[accent];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      style={{
        backgroundColor: 'rgba(9, 11, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      className={cn(
        'relative rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200',
        variant === 'interactive' && [
          'cursor-pointer',
          'hover:bg-[#0d1222]/95',
          hoverBorderColor,
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
