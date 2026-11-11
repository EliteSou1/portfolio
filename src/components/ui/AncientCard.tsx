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
        backgroundColor: 'rgba(8, 6, 20, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      className={cn(
        'relative rounded-xl border border-white/10 transition-colors duration-200',
        variant === 'interactive' && [
          'cursor-pointer',
          hoverBorderColor,
        ],
        className
      )}
      {...props}
    >
      {/* Delicate corner ticks with section accent */}
      <div
        className={cn(
          'absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t border-l pointer-events-none transition-colors duration-200',
          cornerTickColor
        )}
      />
      <div
        className={cn(
          'absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b border-r pointer-events-none transition-colors duration-200',
          cornerTickColor
        )}
      />
      {children}
    </div>
  );
}
