'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, RotateCcw, ExternalLink, Instagram, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';

export function TodayOutreachTable({ outreachRecords, influencers, accounts, employees }) {
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [activeMetaHandle, setActiveMetaHandle] = useState(null);

  const influencerMap = new Map(influencers.map((i) => [i.id, i]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  const filtered = outreachRecords.filter((rec) => {
    const inf = influencerMap.get(rec.influencer_id);
    const acc = accountMap.get(rec.account_id);

    if (accountFilter !== 'ALL' && rec.account_id !== accountFilter) return false;
    if (repeatOnly && !rec.is_repeat_same_account) return false;

    if (search) {
      const q = search.toLowerCase().trim().replace(/^@/, '');
      const handleMatch = inf?.normalized_handle?.includes(q);
      const accMatch = acc?.account_name?.toLowerCase().includes(q);
      const noteMatch = rec.notes?.toLowerCase().includes(q);
      if (!handleMatch && !accMatch && !noteMatch) return false;
    }

    return true;
  });

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
      {/* Header & Controls */}
      <div className="p-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
            <span>Recent Outreach History</span>
            <Badge variant="primary" size="xs">
              {filtered.length} Records
            </Badge>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Log of outreach submissions across your active marketing accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter handle or account..."
              className="pl-9 pr-3 py-2 bg-obsidian-900/90 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-tox-orange w-48 font-mono"
            />
          </div>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 bg-obsidian-900/90 border border-white/10 rounded-xl text-xs text-zinc-200 font-medium focus:outline-none focus:border-tox-orange cursor-pointer"
          >
            <option value="ALL">All Marketing Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_name}
              </option>
            ))}
          </select>

          {/* Repeat Only Toggle */}
          <button
            type="button"
            onClick={() => setRepeatOnly(!repeatOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange ${
              repeatOnly
                ? 'bg-tox-orange/15 border-tox-orange text-tox-orange font-semibold'
                : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Repeats Only</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse dense-table">
          <thead>
            <tr className="border-b border-white/[0.08] bg-obsidian-950/60 font-mono text-xs text-zinc-400 font-medium">
              <th className="py-3.5 px-6">Influencer Handle</th>
              <th className="py-3.5 px-4">Account</th>
              <th className="py-3.5 px-4">Logged By</th>
              <th className="py-3.5 px-4">Date / Time</th>
              <th className="py-3.5 px-4">Outreach Type</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Meta / IG Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-zinc-400">
                  No outreach records match the active criteria.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => {
                const inf = influencerMap.get(rec.influencer_id);
                const acc = accountMap.get(rec.account_id);
                const emp = employeeMap.get(rec.employee_id);
                const handleStr = inf?.instagram_handle || '@unknown';

                return (
                  <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/influencers/${rec.influencer_id}`}
                          className="font-mono font-semibold text-white hover:text-tox-orange transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                        >
                          {handleStr}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                        </Link>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-zinc-200 font-medium text-xs">{acc?.account_name || '—'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-zinc-400 text-xs font-normal">{emp?.full_name || 'Historical Import'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.outreach_date ? (
                        <span className="text-zinc-400 font-mono text-xs tabular-nums">
                          {formatOutreachDate(rec.outreach_date)}
                        </span>
                      ) : (
                        <Badge variant="historical" size="xs">
                          Historical
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.is_repeat_same_account ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> Repeat #{rec.repeat_count_for_account}
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          Standard Touchpoint
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'Replied' || rec.status === 'Interested'
                            ? 'success'
                            : rec.status === 'Follow-up'
                            ? 'warning'
                            : 'info'
                        }
                        size="xs"
                      >
                        {rec.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveMetaHandle(handleStr)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-tox-orange/40 hover:text-tox-orange hover:bg-tox-orange/10 text-[11px] font-medium transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
                      >
                        <Instagram className="h-3 w-3 text-tox-orange" />
                        <span>View In-App</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* In-App Instagram Profile Viewer Modal */}
      {activeMetaHandle && (
        <InstagramProfileViewer
          handle={activeMetaHandle}
          onClose={() => setActiveMetaHandle(null)}
        />
      )}
    </div>
  );
}
