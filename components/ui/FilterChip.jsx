'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export function FilterChip({ label, value, onRemove, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-tox-orange/30 bg-obsidian-900/80 px-3 py-1 text-xs text-zinc-200 font-medium shadow-xs backdrop-blur-md transition-colors hover:border-tox-orange/60',
        className
      )}
    >
      <span className="text-zinc-400 font-normal">{label}:</span>
      <span className="text-white font-semibold">{value}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label} filter`}
          className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:bg-tox-orange/20 hover:text-tox-orange transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
