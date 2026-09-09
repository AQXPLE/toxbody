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
    return <div className="text-xs text-zinc-500 font-mono py-10 text-center">Loading analytics engine...</div>;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Operational & Team Analytics</span>
            <Badge variant="primary" size="sm">
              Timezone: Central (CT)
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated outreach volume, repeat rate tracking, account utilization, and staff performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            Total Outreach: {metrics.totalOutreach}
          </Badge>
          <Badge variant="repeat" size="sm">
            Repeat Rate: {metrics.repeatRate}%
          </Badge>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-400">
            Outreach Today
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">{metrics.outreachToday}</div>
          <div className="text-[11px] text-zinc-500 font-sans">Current active business day</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-400">
            Outreach This Month
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{metrics.outreachThisMonth}</div>
          <div className="text-[11px] text-zinc-500 font-sans">Rolling 30-day window</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-400">
            Unique Influencers
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.uniqueInfluencersReached}</div>
          <div className="text-[11px] text-zinc-500 font-sans">Distinct target creators reached</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-400">
            Same-Account Repeats
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.repeatOutreachCount}</div>
          <div className="text-[11px] text-zinc-500 font-sans">{metrics.repeatRate}% overall repeat rate</div>
        </div>
      </div>

      {/* Data Integrity Strategy: Dated vs Historical Undated Breakdown */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
          <span>Outreach Record Provenance (Date Integrity Policy)</span>
          <span className="text-[11px] font-normal text-zinc-400">
            Legacy imported data preserves NULL dates without fabrication
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Active / Dated Outreaches</div>
              <div className="text-[11px] text-zinc-400">Submitted with timestamps via live platform</div>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{datedCount}</div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Historical Undated Outreaches</div>
              <div className="text-[11px] text-zinc-400">Imported from legacy Sheet1.tsv (dates NULL)</div>
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">{historicalCount}</div>
          </div>
        </div>
      </div>

      {/* Account Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Performance */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Outreach Output by Account</span>
            <Badge variant="default" size="xs">
              {accounts.length} Accounts
            </Badge>
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {accountBreakdown.map((acc) => (
              <div
                key={acc.id}
                className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <Instagram className="h-3.5 w-3.5 text-amber-400" />
                    <span>{acc.name}</span>
                    <span className="font-mono text-zinc-500 text-[11px]">@{acc.handle}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {acc.repeats} repeat outreach records ({acc.repeatRate}% repeat rate)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-zinc-100">{acc.total}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Outreaches</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Staff Outreach Output</span>
            <Badge variant="default" size="xs">
              {employees.length} Staff
            </Badge>
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {employeeBreakdown.map((emp) => (
              <div
                key={emp.id}
                className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <span>{emp.name}</span>
                    <Badge variant="default" size="xs" className="uppercase font-mono text-[10px]">
                      {emp.role}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {emp.repeats} repeats logged
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-amber-400">{emp.total}</div>
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
