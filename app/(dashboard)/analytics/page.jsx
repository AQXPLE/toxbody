'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import {
  BarChart3,
  Calendar,
  Instagram,
  Users,
  RotateCcw,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [outreachRecords, setOutreachRecords] = useState([]);
  const [timeRange, setTimeRange] = useState('ALL');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const [m, accs, emps, outs] = await Promise.all([
      db.getDashboardMetrics(),
      db.getAccounts(),
      db.getEmployees(),
      db.getOutreachRecords(),
    ]);
    setMetrics(m);
    setAccounts(accs);
    setEmployees(emps);
    setOutreachRecords(outs);
  };

  if (!metrics) {
    return (
      <div className="text-xs text-zinc-500 font-mono py-24 text-center space-y-3">
        <div className="h-7 w-7 rounded-full border-2 border-tox-orange border-t-transparent animate-spin mx-auto shadow-tox-orange" />
        <p className="tracking-wide">Initializing analytics engine...</p>
      </div>
    );
  }

  // Account outreach breakdown
  const accountBreakdown = accounts
    .map((acc) => {
      const accOut = outreachRecords.filter((o) => o.account_id === acc.id);
      const repeats = accOut.filter((o) => o.is_repeat_same_account).length;
      return {
        id: acc.id,
        name: acc.account_name,
        handle: acc.instagram_handle,
        total: accOut.length,
        repeats,
        repeatRate: accOut.length > 0 ? ((repeats / accOut.length) * 100).toFixed(0) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Employee output breakdown
  const employeeBreakdown = employees
    .map((emp) => {
      const empOut = outreachRecords.filter((o) => o.employee_id === emp.id);
      const repeats = empOut.filter((o) => o.is_repeat_same_account).length;
      return {
        id: emp.id,
        name: emp.full_name,
        role: emp.role,
        total: empOut.length,
        repeats,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Dated vs Historical counts
  const datedCount = outreachRecords.filter((o) => o.outreach_date !== null).length;
  const historicalCount = outreachRecords.filter((o) => o.outreach_date === null).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <BarChart3 className="h-3.5 w-3.5 text-tox-orange" />
            <span>Operations Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Operational & Team Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Outreach volumes, repeat rate auditing, regional account utilization, and staff member throughput.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" size="sm">
            Total Outreach: {metrics.totalOutreach}
          </Badge>
          <Badge variant="repeat" size="sm">
            Repeat Rate: {metrics.repeatRate}%
          </Badge>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase tracking-wider font-mono font-medium text-zinc-400">
            Outreach Today
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {metrics.outreachToday}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Current active business day</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group border-tox-orange/20">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-tox-orange/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-[11px] uppercase tracking-wider font-mono font-medium text-tox-orange">
            Outreach This Month
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-tox-orange tracking-tight">
            {metrics.outreachThisMonth}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Rolling 30-day window</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase tracking-wider font-mono font-medium text-zinc-400">
            Unique Influencers
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tracking-tight">
            {metrics.uniqueInfluencersReached}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Distinct creators touched</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase tracking-wider font-mono font-medium text-zinc-400">
            Same-Account Repeats
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 tracking-tight">
            {metrics.repeatOutreachCount}
          </div>
          <div className="text-xs text-zinc-500 font-mono">{metrics.repeatRate}% overall repeat rate</div>
        </div>
      </div>

      {/* Provenance Breakdown */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <span className="text-white font-semibold">Outreach Record Provenance (Date Integrity Policy)</span>
          <span className="text-xs font-normal text-zinc-500 hidden sm:inline">
            Legacy data preserves NULL dates without artificial timestamp fabrication
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div>
              <div className="text-xs font-semibold text-white">Active / Dated Outreaches</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Submitted with ISO timestamps via live platform</div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{datedCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div>
              <div className="text-xs font-semibold text-white">Historical Undated Outreaches</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Imported from legacy Sheet1.tsv (dates NULL)</div>
            </div>
            <div className="text-2xl font-bold font-mono text-tox-orange">{historicalCount}</div>
          </div>
        </div>
      </div>

      {/* Account & Staff Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Performance */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Outreach Volume by Account
            </h3>
            <Badge variant="primary" size="xs">
              {accounts.length} Accounts
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {accountBreakdown.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl border border-white/[0.06] bg-obsidian-900/60 hover:bg-white/[0.03] flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <Instagram className="h-3.5 w-3.5 text-tox-orange" />
                    <span>{acc.name}</span>
                    <span className="font-mono text-zinc-500 text-[11px]">@{acc.handle}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {acc.repeats} repeat touches ({acc.repeatRate}% repeat rate)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-white">{acc.total}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Outreaches</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Staff Outreach Output
            </h3>
            <Badge variant="primary" size="xs">
              {employees.length} Staff
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {employeeBreakdown.map((emp) => (
              <div
                key={emp.id}
                className="p-3.5 rounded-2xl border border-white/[0.06] bg-obsidian-900/60 hover:bg-white/[0.03] flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{emp.name}</span>
                    <Badge variant="default" size="xs" className="uppercase font-mono text-[10px]">
                      {emp.role}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {emp.repeats} repeats logged
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-tox-orange">{emp.total}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Logged</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
