import React from 'react';
import { cn } from '@/lib/utils.js';

export function Badge({ children, variant = 'default', size = 'sm', className }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-orange-50 text-[#ff5500] border-orange-200 font-semibold',
    orange: 'bg-orange-500 text-white border-orange-600 font-bold shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    repeat: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
    cross: 'bg-blue-50 text-blue-700 border-blue-200',
    black: 'bg-zinc-950 text-white border-zinc-900',
    historical: 'bg-slate-100 text-slate-500 border-slate-200 text-[11px] italic',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors shadow-2xs',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
    >
      {children}
    </span>
  );
}
