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
      <div className="text-xs text-zinc-500 font-mono py-16 text-center space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
        <p>Loading analytics engine...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-[11px] font-bold mb-2">
            <BarChart3 className="h-3 w-3" />
            <span>Operations Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            Operational & Team Analytics
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
            Outreach volumes, repeat rate auditing, account utilization, and staff member performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
            Outreach Today
          </div>
          <div className="text-3xl font-black font-mono text-zinc-950">{metrics.outreachToday}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Current active business day</div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
            Outreach This Month
          </div>
          <div className="text-3xl font-black font-mono text-[#ff5500]">{metrics.outreachThisMonth}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Rolling 30-day window</div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
            Unique Influencers
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">{metrics.uniqueInfluencersReached}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Distinct creators touched</div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
            Same-Account Repeats
          </div>
          <div className="text-3xl font-black font-mono text-orange-600">{metrics.repeatOutreachCount}</div>
          <div className="text-[11px] text-zinc-500 font-medium">{metrics.repeatRate}% overall repeat rate</div>
        </div>
      </div>

      {/* Provenance breakdown */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-tox-lg space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-3">
          <span>Outreach Record Provenance (Date Integrity Policy)</span>
          <span className="text-xs font-normal text-zinc-500">
            Legacy data preserves NULL dates without artificial timestamp fabrication
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900">Active / Dated Outreaches</div>
              <div className="text-[11px] text-zinc-500">Submitted with ISO timestamps via live platform</div>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600">{datedCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900">Historical Undated Outreaches</div>
              <div className="text-[11px] text-zinc-500">Imported from legacy Sheet1.tsv (dates NULL)</div>
            </div>
            <div className="text-2xl font-black font-mono text-orange-600">{historicalCount}</div>
          </div>
        </div>
      </div>

      {/* Account Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Performance */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-tox-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-3">
            <span>Outreach Volume by Account</span>
            <Badge variant="primary" size="xs">
              {accounts.length} Accounts
            </Badge>
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {accountBreakdown.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/70 hover:bg-zinc-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-2">
                    <Instagram className="h-3.5 w-3.5 text-[#ff5500]" />
                    <span>{acc.name}</span>
                    <span className="font-mono text-zinc-500 text-[11px]">@{acc.handle}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                    {acc.repeats} repeat outreach touches ({acc.repeatRate}% repeat rate)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black font-mono text-zinc-950">{acc.total}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Outreaches</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-tox-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-3">
            <span>Staff Outreach Output</span>
            <Badge variant="primary" size="xs">
              {employees.length} Staff
            </Badge>
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {employeeBreakdown.map((emp) => (
              <div
                key={emp.id}
                className="p-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/70 hover:bg-zinc-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-2">
                    <span>{emp.name}</span>
                    <Badge variant="default" size="xs" className="uppercase font-mono text-[10px]">
                      {emp.role}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                    {emp.repeats} repeats logged
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black font-mono text-[#ff5500]">{emp.total}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Logged</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
