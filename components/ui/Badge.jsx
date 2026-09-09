import React from 'react';
import { cn } from '@/lib/utils.js';

export function Badge({ children, variant = 'default', size = 'sm', className }) {
  const variantStyles = {
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    primary: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    repeat: 'bg-amber-950/40 text-amber-300 border-amber-600/50 font-semibold',
    cross: 'bg-blue-950/40 text-blue-300 border-blue-600/50',
    historical: 'bg-zinc-800/90 text-zinc-400 border-zinc-700/60 text-xs italic',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
    >
      {children}
    </span>
  );
}
