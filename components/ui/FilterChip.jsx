'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export function FilterChip({ label, value, onRemove, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-300 font-medium shadow-sm transition-colors hover:border-zinc-600',
        className
      )}
    >
      <span className="text-zinc-400 font-normal">{label}:</span>
      <span className="text-zinc-100 font-semibold">{value}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
