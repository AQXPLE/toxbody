'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, RotateCcw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';

export function TodayOutreachTable({ outreachRecords, influencers, accounts, employees }) {
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [repeatOnly, setRepeatOnly] = useState(false);

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
    <div className="rounded-xl border border-zinc-800 bg-[#121319] overflow-hidden shadow-xl">
      {/* Header & Controls */}
      <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>Recent Outreach History</span>
            <Badge variant="default" size="xs">
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
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter handle or account..."
              className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 w-44 font-mono"
            />
          </div>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Accounts</option>
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
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              repeatOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
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
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="py-3 px-4">Influencer</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Logged By</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Outreach Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                  No outreach records match the active criteria.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => {
                const inf = influencerMap.get(rec.influencer_id);
                const acc = accountMap.get(rec.account_id);
                const emp = employeeMap.get(rec.employee_id);

                return (
                  <tr key={rec.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/influencers/${rec.influencer_id}`}
                          className="font-mono font-semibold text-zinc-200 hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          {inf?.instagram_handle || '@unknown'}
                          <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                        </Link>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-zinc-300 font-medium">{acc?.account_name || '—'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-zinc-400 text-xs">{emp?.full_name || 'Historical Import'}</span>
                    </td>

                    <td className="py-3 px-4">
                      {rec.outreach_date ? (
                        <span className="text-zinc-300 font-mono text-xs">
                          {formatOutreachDate(rec.outreach_date)}
                        </span>
                      ) : (
                        <Badge variant="historical" size="xs">
                          Historical / Date unavailable
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {rec.is_repeat_same_account ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> Same-Account Repeat (#{rec.repeat_count_for_account})
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          Standard Outreach
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4">
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

                    <td className="py-3 px-4 max-w-xs truncate text-zinc-400 text-xs">
                      {rec.notes || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
