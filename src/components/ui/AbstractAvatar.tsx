import React from 'react';
import { cn } from '@/lib/utils';

interface AbstractAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AbstractAvatar({ className, size = 'md' }: AbstractAvatarProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-lg border border-[#1e3440] bg-[#070c10] p-1 shadow-[0_0_20px_rgba(26,209,215,0.08)] group overflow-hidden',
        sizeMap[size],
        className
      )}
    >
      {/* Background geometric grid overlay */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1ad1d7_1px,transparent_1px)] [background-size:6px_6px]" />

      {/* SVG Ancient Celestial Monogram */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-[#1ad1d7] transition-transform duration-700 group-hover:rotate-45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        {/* Outer diamond */}
        <polygon
          points="50,6 94,50 50,94 6,50"
          className="stroke-[#2a4d5b] fill-none transition-colors group-hover:stroke-[#1ad1d7]"
          strokeWidth="1.5"
        />

        {/* Concentric orbital circles */}
        <circle cx="50" cy="50" r="32" stroke="#163844" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="20" stroke="#1ad1d7" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Core geometric nexus */}
        <polygon points="50,28 69,50 50,72 31,50" stroke="#2be5f0" strokeWidth="1.8" fill="#0b171f" />

        {/* Precision crosshair ticks */}
        <line x1="50" y1="14" x2="50" y2="24" stroke="#1ad1d7" strokeWidth="1.5" />
        <line x1="50" y1="76" x2="50" y2="86" stroke="#1ad1d7" strokeWidth="1.5" />
        <line x1="14" y1="50" x2="24" y2="50" stroke="#1ad1d7" strokeWidth="1.5" />
        <line x1="76" y1="50" x2="86" y2="50" stroke="#1ad1d7" strokeWidth="1.5" />

        {/* Center glowing dot */}
        <circle cx="50" cy="50" r="3.5" fill="#46f0fa" className="animate-pulse" />
      </svg>

      {/* Corner precision accents */}
      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-[#1ad1d7] opacity-60" />
      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-[#1ad1d7] opacity-60" />
    </div>
  );
}
