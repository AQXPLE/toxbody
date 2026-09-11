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
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-tox-orange/15 border border-tox-orange/30 flex items-center justify-center text-tox-orange shadow-tox-orange">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">
                How The Tox Technique Platform Works
              </h2>
              <Badge variant="primary" size="xs">
                Visual Architecture
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click to {isOpen ? 'collapse' : 'expand'} the entity architecture & repeat outreach detection engine.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isOpen ? 'Collapse explainer' : 'Expand explainer'}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-6 pt-4 border-t border-white/[0.06] space-y-5 bg-black/20">
          {/* 4-Step Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-obsidian-900/60 backdrop-blur-md space-y-2 hover:border-white/[0.15] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-tox-orange uppercase tracking-wider">
                  Step 1 • Master Entity
                </span>
                <div className="h-6 w-6 rounded-lg bg-tox-orange/10 border border-tox-orange/20 text-tox-orange flex items-center justify-center font-bold text-xs">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white">Influencer Profile</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Unique creator in the database. Normalized handle (e.g. <span className="font-mono font-medium text-zinc-200">@jessicajane</span>), followers, city, niche. Stored once.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-obsidian-900/60 backdrop-blur-md space-y-2 hover:border-white/[0.15] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-tox-orange uppercase tracking-wider">
                  Step 2 • Senders
                </span>
                <div className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/10 text-white flex items-center justify-center font-bold text-xs">
                  <Instagram className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white">Marketing Accounts</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                ~70 unique Instagram accounts (e.g. <span className="font-mono font-medium text-zinc-200">Alamo</span>, <span className="font-mono font-medium text-zinc-200">Southlake</span>). Staff have access to ~10 assigned accounts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-obsidian-900/60 backdrop-blur-md space-y-2 hover:border-white/[0.15] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-tox-orange uppercase tracking-wider">
                  Step 3 • Events
                </span>
                <div className="h-6 w-6 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white">Outreach Records</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Every outreach is an event connecting <span className="font-medium text-zinc-200">Staff → Account → Influencer → Date</span>. Historical records remain forever.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-tox-orange/30 bg-tox-orange/[0.04] backdrop-blur-md space-y-2 hover:border-tox-orange/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-tox-orange uppercase tracking-wider">
                  Step 4 • Logic
                </span>
                <div className="h-6 w-6 rounded-lg bg-tox-orange text-black flex items-center justify-center font-bold text-xs shadow-tox-orange">
                  <RotateCcw className="h-3.5 w-3.5" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white">Smart Repeat Check</h3>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Reaching from a <span className="font-semibold text-sky-400">different account</span> is legitimate cross-account. Reaching from the <span className="font-semibold text-tox-orange">same account</span> flags a Repeat.
              </p>
            </div>
          </div>

          {/* Real-world Example Banner */}
          <div className="rounded-xl border border-white/10 bg-obsidian-900/90 p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl shadow-lg shadow-black/40">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-tox-orange">
                  Example Scenario:
                </span>
                <span className="text-xs font-semibold text-white">Target Creator: @example</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                1. Daniyal logs @example from <span className="font-semibold text-white">Alamo</span> (Sept 1) → <Badge variant="success" size="xs">New Influencer</Badge><br />
                2. Ahmed logs @example from <span className="font-semibold text-white">McKinney</span> (Sept 3) → <Badge variant="cross" size="xs">Cross-Account Legitimate</Badge><br />
                3. Daniyal logs @example from <span className="font-semibold text-white">Alamo</span> again (Oct 8) → <Badge variant="repeat" size="xs">Same-Account Repeat (#1)</Badge>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Telemetry:</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-tox-orange/30 font-mono text-xs font-semibold text-tox-orange tabular-nums shadow-xs">
                1 Influencer • 3 Outreaches • 1 Repeat
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
