'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { ShieldCheck, Clock, User, Search } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.getAuditLogs(100).then(setLogs);
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user_name.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>System Audit Logs</span>
            <Badge variant="danger" size="sm">
              Admin Only
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable administrative audit trail tracking logins, role modifications, bulk outreach commits, and migration batches.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No audit log events recorded yet. Actions will appear automatically as team members log outreach or modify settings.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-200">
                      {log.user_name}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="xs" className="font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px] max-w-md truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
