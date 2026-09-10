'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Clock, Database, Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';

export function Topbar({ onOpenSearch, currentUser }) {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-10 select-none shadow-xs">
      {/* Search Input Trigger (Cmd+K) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-zinc-200 bg-slate-50 text-zinc-500 hover:text-zinc-900 hover:border-orange-300 hover:bg-orange-50/20 transition-all text-xs w-64 md:w-80 group shadow-2xs"
        >
          <Search className="h-4 w-4 text-zinc-400 group-hover:text-[#ff5500] transition-colors" />
          <span className="flex-1 text-left font-medium">Search creators, accounts, cities...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Database Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-600 bg-slate-50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-zinc-500">Database:</span>
          <span className="text-zinc-900 font-bold">Supabase PostgreSQL</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Meta IG Search Shortcut */}
        <Link
          href="/meta-search"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-orange-300 bg-white hover:bg-orange-50/40 text-xs font-semibold text-zinc-800 transition-colors shadow-2xs"
        >
          <Instagram className="h-3.5 w-3.5 text-[#ff5500]" />
          <span>Meta IG Search</span>
        </Link>

        {/* Timezone Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 bg-slate-50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-[#ff5500]" />
          <span className="font-mono font-medium text-zinc-800">CT (America/Chicago)</span>
        </div>

        {/* Quick Log Action */}
        <Link
          href="/outreach"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Log Outreach</span>
        </Link>
      </div>
    </header>
  );
}
