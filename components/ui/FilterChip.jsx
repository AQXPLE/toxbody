'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export function FilterChip({ label, value, onRemove, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-xs text-zinc-800 font-medium shadow-xs transition-colors hover:border-orange-300',
        className
      )}
    >
      <span className="text-zinc-500 font-normal">{label}:</span>
      <span className="text-zinc-900 font-bold">{value}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:bg-orange-200 hover:text-zinc-900 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
