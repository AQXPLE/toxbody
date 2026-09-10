'use client';

import React from 'react';
import { extractAndNormalizeHandles } from '@/lib/normalization.js';
import { Copy, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

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
        <label className="font-bold text-zinc-900 flex items-center gap-2">
          <span>Instagram Handles to Log</span>
          <span className="text-[11px] font-normal text-zinc-500">
            (Paste one per line, comma-separated, or IG links)
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePasteExample}
            className="text-[#ff5500] hover:text-[#e04a00] font-bold text-xs inline-flex items-center gap-1 hover:underline underline-offset-2 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Paste Sample Batch
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl border border-zinc-200 bg-white focus-within:border-[#ff5500] focus-within:ring-2 focus-within:ring-[#ff5500]/20 transition-all shadow-sm">
        <textarea
          rows={6}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="@jessica&#10;@taylor_wellness&#10;https://instagram.com/sarahsmith"
          className="w-full bg-transparent p-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono resize-y leading-relaxed"
        />

        {/* Floating count indicator */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 bg-zinc-50/80 rounded-b-2xl text-[11px]">
          <div className="text-zinc-600 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5500]"></span>
            <span>Handles Detected:</span>
            <span className="font-mono font-bold text-zinc-900">{handles.length}</span>
            {handles.length > validCount && (
              <span className="text-rose-600 font-medium">({handles.length - validCount} invalid format)</span>
            )}
          </div>
          <div className="text-zinc-400 text-[11px] font-medium">Batch duplicates are auto-merged</div>
        </div>
      </div>
    </div>
  );
}
