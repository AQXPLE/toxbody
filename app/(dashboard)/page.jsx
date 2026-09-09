'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { InfluencerDrawer } from '@/components/influencers/InfluencerDrawer.jsx';
import { formatOutreachDate, formatShortDate } from '@/lib/utils.js';
import {
  Send,
  Users,
  Instagram,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentOutreach, setRecentOutreach] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [m, outs, accs, emps, infs] = await Promise.all([
      db.getDashboardMetrics(),
      db.getOutreachRecords(),
      db.getAccounts(),
      db.getEmployees(),
      db.getInfluencers(),
    ]);
    setMetrics(m);
    setRecentOutreach(outs.slice(0, 8));
    setAccounts(accs);
    setEmployees(emps);
    setInfluencers(infs);
  };

  if (!metrics) {
    return <div className="text-xs text-zinc-500 font-mono py-12 text-center">Loading operational dashboard...</div>;
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const influencerMap = new Map(influencers.map((i) => [i.id, i]));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Operations Control Center
            </h1>
            <Badge variant="primary" size="sm">
              The Tox Technique
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <span className="text-zinc-200 font-semibold">{currentUser?.full_name}</span> ({currentUser?.role}). Real-time multi-account outreach monitoring and duplicate prevention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/outreach"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Outreach Batch</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] uppercase font-mono text-zinc-400">
            <span>Outreach Today</span>
            <Send className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
            {metrics.outreachToday}
          </div>
          <div className="text-[11px] text-zinc-500">
            {metrics.outreachThisWeek} logged this week
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] uppercase font-mono text-zinc-400">
            <span>Master Influencers</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {metrics.totalInfluencers}
          </div>
          <div className="text-[11px] text-zinc-500">
            {metrics.uniqueInfluencersReached} reached via outreach
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] uppercase font-mono text-zinc-400">
            <span>Active Accounts</span>
            <Instagram className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {metrics.activeAccountsCount}
          </div>
          <div className="text-[11px] text-zinc-500">
            Across {accounts.length} marketing handles
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] uppercase font-mono text-zinc-400">
            <span>Repeat Touchpoints</span>
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {metrics.repeatOutreachCount}
          </div>
          <div className="text-[11px] text-zinc-500">
            {metrics.repeatRate}% same-account repeat rate
          </div>
        </div>
      </div>

      {/* Core Scenarios Showcase Card */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/15 via-[#121319] to-zinc-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono">
                Canonical Architecture & Repeat Detection in Action
              </h2>
              <p className="text-xs text-zinc-400">
                Notice how the specification's required scenario is tracked in the system:
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const ex = influencers.find((i) => i.normalized_handle === 'example');
              if (ex) setSelectedInfluencer(ex);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <span>Inspect @example Dossier</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Touchpoint 1 (Alamo)</span>
            <div className="font-semibold text-zinc-200">Daniyal → Alamo → @example</div>
            <div className="text-[11px] text-emerald-400">✓ Brand new influencer created</div>
          </div>

          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Touchpoint 2 (McKinney)</span>
            <div className="font-semibold text-zinc-200">Ahmed → McKinney → @example</div>
            <div className="text-[11px] text-blue-400">⇄ Legitimate cross-account touchpoint</div>
          </div>

          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">Touchpoint 3 (Alamo)</span>
            <div className="font-semibold text-zinc-200">Daniyal → Alamo → @example</div>
            <div className="text-[11px] text-amber-400">↻ SAME-ACCOUNT REPEAT flagged (#1)</div>
          </div>
        </div>
      </div>

      {/* Live Recent Feed */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] overflow-hidden shadow-xl space-y-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Live Outreach Stream</span>
              <Badge variant="default" size="xs">
                Recent 8 Entries
              </Badge>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any influencer handle to view the chronological cross-account dossier.
            </p>
          </div>

          <Link
            href="/outreach"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 flex items-center gap-1"
          >
            <span>Log Batch</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70">
                <th className="py-2.5 px-4">Influencer</th>
                <th className="py-2.5 px-4">Marketing Account</th>
                <th className="py-2.5 px-4">Staff Member</th>
                <th className="py-2.5 px-4">Date / Time</th>
                <th className="py-2.5 px-4">Touchpoint Type</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {recentOutreach.map((rec) => {
                const inf = influencerMap.get(rec.influencer_id);
                const acc = accountMap.get(rec.account_id);
                const emp = employeeMap.get(rec.employee_id);

                return (
                  <tr
                    key={rec.id}
                    onClick={() => inf && setSelectedInfluencer(inf)}
                    className="hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                        {inf?.instagram_handle || '@unknown'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-medium text-zinc-300 text-xs">
                      {acc?.account_name || '—'}
                    </td>

                    <td className="py-2.5 px-4 text-xs text-zinc-400">
                      {emp?.full_name || 'Historical Import'}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-xs text-zinc-400">
                      {rec.outreach_date ? (
                        formatOutreachDate(rec.outreach_date)
                      ) : (
                        <Badge variant="historical" size="xs">
                          Historical / Date unavailable
                        </Badge>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {rec.is_repeat_same_account ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> Same-Account Repeat (#{rec.repeat_count_for_account})
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          Outreach
                        </Badge>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      <Badge variant="info" size="xs">
                        {rec.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Influencer Drawer */}
      <InfluencerDrawer
        influencer={selectedInfluencer}
        outreachHistory={
          selectedInfluencer
            ? recentOutreach.filter((o) => o.influencer_id === selectedInfluencer.id)
            : []
        }
        accounts={accounts}
        employees={employees}
        onClose={() => setSelectedInfluencer(null)}
      />
    </div>
  );
}
