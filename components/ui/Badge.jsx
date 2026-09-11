import React from 'react';
import { cn } from '@/lib/utils.js';

export function Badge({ children, variant = 'default', size = 'sm', className }) {
  const variantStyles = {
    default: 'bg-white/[0.06] text-zinc-300 border-white/[0.1]',
    primary: 'bg-[#ff5500]/15 text-[#ff5500] border-[#ff5500]/30 font-semibold',
    orange: 'bg-[#ff5500] text-white border-[#ff5500] font-bold shadow-tox-orange',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    repeat: 'bg-[#ff5500]/20 text-[#ff6a1a] border-[#ff5500]/40 font-bold',
    cross: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    black: 'bg-white/[0.1] text-white border-white/[0.2]',
    historical: 'bg-white/[0.04] text-zinc-500 border-white/[0.06] text-[11px] italic',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-colors shadow-8k',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
    >
      {children}
    </span>
  );
}
