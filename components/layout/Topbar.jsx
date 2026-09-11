'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Clock, Database, Instagram, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';

export function Topbar({ onOpenSearch, currentUser }) {
  return (
    <header className="h-16 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl px-6 flex items-center justify-between z-10 select-none sticky top-0">
      {/* Search Input Trigger (Cmd+K) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-white/[0.18] hover:bg-zinc-900 transition-all text-xs w-64 md:w-80 group shadow-8k"
        >
          <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#ff5500] transition-colors" />
          <span className="flex-1 text-left font-medium">Search creators, accounts, cities...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* Database Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-8k">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-500 font-mono text-[11px]">Database:</span>
          <span className="text-zinc-200 font-bold font-mono text-[11px]">Supabase PostgreSQL</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Meta IG Search Shortcut */}
        <Link
          href="/meta-search"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.2] bg-zinc-900/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-all shadow-8k"
        >
          <Instagram className="h-3.5 w-3.5 text-[#ff5500]" />
          <span>Meta IG Search</span>
        </Link>

        {/* Timezone Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-8k">
          <Clock className="h-3.5 w-3.5 text-[#ff5500]" />
          <span className="font-mono font-medium text-zinc-300 text-[11px]">CT (America/Chicago)</span>
        </div>

        {/* Quick Log Action */}
        <Link
          href="/outreach"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#ff5500] hover:bg-[#ff6a1a] text-white text-xs font-bold shadow-tox-orange transition-all border-t border-white/20 active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Outreach</span>
        </Link>
      </div>
    </header>
  );
}
