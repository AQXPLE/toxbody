'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Instagram,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';

export function DataModelExplainer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-tox-md overflow-hidden transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-orange-50/60 via-white to-orange-50/30 hover:bg-orange-50/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#ff5500] flex items-center justify-center text-white shadow-tox-orange">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900">
                How The Tox Technique Platform Works
              </h2>
              <Badge variant="primary" size="xs">
                Quick Visual Guide
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click to {isOpen ? 'hide' : 'show'} the visual data model & repeat outreach logic.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-6 pt-2 border-t border-zinc-100 space-y-6">
          {/* 4-Step Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-slate-50/50 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff5500] uppercase tracking-wider">
                  Step 1 • Master Entity
                </span>
                <div className="h-6 w-6 rounded-lg bg-orange-100 text-[#ff5500] flex items-center justify-center font-bold text-xs">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Influencer Profile</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Unique creator in the database. Normalized handle (e.g. <span className="font-mono font-bold text-zinc-800">@jessicajane</span>), followers, city, niche. Stored once.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff5500] uppercase tracking-wider">
                  Step 2 • Senders
                </span>
                <div className="h-6 w-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  <Instagram className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Marketing Accounts</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                ~70 unique Instagram accounts (e.g. <span className="font-mono font-bold text-zinc-800">Alamo</span>, <span className="font-mono font-bold text-zinc-800">Southlake</span>). Staff have access to ~10 assigned accounts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff5500] uppercase tracking-wider">
                  Step 3 • Events
                </span>
                <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Outreach Records</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Every outreach is an event connecting <span className="font-semibold text-zinc-800">Staff → Account → Influencer → Date</span>. Historical records remain forever.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-orange-300 bg-orange-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff5500] uppercase tracking-wider">
                  Step 4 • Logic
                </span>
                <div className="h-6 w-6 rounded-lg bg-[#ff5500] text-white flex items-center justify-center font-bold text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Smart Repeat Check</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Reaching from a <span className="font-semibold text-blue-700">different account</span> is legitimate cross-account. Reaching from the <span className="font-bold text-[#ff5500]">same account</span> flags a Repeat.
              </p>
            </div>
          </div>

          {/* Real-world Example Banner */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-400 font-mono">
                  Example Scenario:
                </span>
                <span className="text-xs font-bold text-white">Target Creator: @example</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                1. Daniyal logs @example from <span className="font-semibold text-white">Alamo</span> (Sept 1) → <Badge variant="success" size="xs">New Influencer</Badge><br />
                2. Ahmed logs @example from <span className="font-semibold text-white">McKinney</span> (Sept 3) → <Badge variant="cross" size="xs">Cross-Account Legitimate</Badge><br />
                3. Daniyal logs @example from <span className="font-semibold text-white">Alamo</span> again (Oct 8) → <Badge variant="repeat" size="xs">Same-Account Repeat (#1)</Badge>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Result:</span>
              <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-xs font-bold text-orange-400">
                1 Influencer • 3 Outreaches • 1 Repeat
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
