'use client';

import React from 'react';
import { extractAndNormalizeHandles } from '@/lib/normalization.js';
import { Copy, Trash2, CheckCircle } from 'lucide-react';

export function HandleInput({ value, onChange, disabled }) {
  const handles = extractAndNormalizeHandles(value);
  const validCount = handles.filter((h) => h.isValid).length;

  const handlePasteExample = () => {
    const exampleText = `@example\n@thatothetallgirl\nhttps://instagram.com/notboredindc\n@janesmith`;
    onChange(exampleText);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-zinc-200 flex items-center gap-2">
          <span>Influencer Instagram Handles</span>
          <span className="text-[11px] font-normal text-zinc-400">
            (Paste one per line, comma-separated, or IG URLs)
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePasteExample}
            className="text-amber-400 hover:text-amber-300 font-medium text-[11px] underline underline-offset-2"
          >
            Paste Sample Batch
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-lg border border-zinc-800 bg-[#121318] focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-inner">
        <textarea
          rows={6}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="@jessica&#10;@taylor_wellness&#10;https://instagram.com/sarahsmith"
          className="w-full bg-transparent p-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono resize-y leading-relaxed"
        />

        {/* Floating count indicator */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-3.5 py-2 bg-zinc-900/40 text-[11px]">
          <div className="text-zinc-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>Handles Detected:</span>
            <span className="font-mono font-bold text-zinc-200">{handles.length}</span>
            {handles.length > validCount && (
              <span className="text-rose-400">({handles.length - validCount} invalid format)</span>
            )}
          </div>
          <div className="text-zinc-500 text-[10px]">Duplicates in batch are auto-merged</div>
        </div>
      </div>
    </div>
  );
}
