'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Clock, Database } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';

export function Topbar({ onOpenSearch, currentUser }) {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0e0f13]/80 backdrop-blur-md px-6 flex items-center justify-between z-10 select-none">
      {/* Search Input Trigger (Cmd+K) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all text-xs w-64 md:w-80 group shadow-inner"
        >
          <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
          <span className="flex-1 text-left">Search influencers, accounts, locations...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* Database Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-md px-2.5 py-1">
          <Database className="h-3 w-3 text-emerald-400" />
          <span>Storage:</span>
          <span className="text-zinc-200 font-medium">PostgreSQL / Local Seed</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Timezone Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-md px-2.5 py-1">
          <Clock className="h-3 w-3 text-amber-400/80" />
          <span className="font-mono text-zinc-300">Central Time (CT)</span>
        </div>

        {/* Quick Log Action */}
        <Link
          href="/outreach"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Outreach</span>
        </Link>
      </div>
    </header>
  );
}
