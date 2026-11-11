import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'stone' | 'outline' | 'gold' | 'magenta' | 'violet';
  dot?: boolean;
}

export function Badge({
  children,
  className,
  variant = 'default',
  dot = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono tracking-widest uppercase select-none transition-colors duration-200',
        variant === 'default' && 'bg-[#120d24]/70 text-[#cbd5e1] border border-white/10',
        variant === 'accent' && 'bg-[#291724]/70 text-[#ffcf8a] border border-[#ffcf8a]/35',
        variant === 'gold' && 'bg-[#2b1f11]/70 text-[#ffcf8a] border border-[#ffcf8a]/40',
        variant === 'magenta' && 'bg-[#2a0e22]/70 text-[#ec4899] border border-[#ec4899]/40',
        variant === 'violet' && 'bg-[#1b1035]/70 text-[#c084fc] border border-[#8b5cf6]/40',
        variant === 'stone' && 'bg-[#0e0c1a]/70 text-[#94a3b8] border border-white/10',
        variant === 'outline' && 'bg-transparent text-[#cbd5e1] border border-white/15',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            variant === 'magenta' ? 'bg-[#ec4899]' : variant === 'violet' ? 'bg-[#8b5cf6]' : 'bg-[#ffcf8a]'
          )}
        />
      )}
      {children}
    </span>
  );
}
