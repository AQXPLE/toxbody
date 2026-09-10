'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { ShieldCheck, Clock, User, Search, ShieldAlert } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-[11px] font-bold mb-2">
            <ShieldAlert className="h-3 w-3" />
            <span>Compliance & Audit</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            System Audit Logs
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
            Immutable administrative audit trail tracking logins, role modifications, bulk outreach commits, and migration batches.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff5500] font-mono shadow-2xs"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-tox-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="py-3.5 px-6 font-bold text-zinc-500">Timestamp (CT)</th>
                <th className="py-3.5 px-4 font-bold text-zinc-500">User</th>
                <th className="py-3.5 px-4 font-bold text-zinc-500">Action Event</th>
                <th className="py-3.5 px-4 font-bold text-zinc-500">Entity Type</th>
                <th className="py-3.5 px-6 font-bold text-zinc-500">Payload Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-sans text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No audit log events recorded yet. Actions will appear automatically as team members log outreach or modify settings.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-zinc-600 text-[11px] font-medium">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-950">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary" size="xs" className="font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-600 text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-zinc-500 text-[11px] max-w-md truncate">
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
