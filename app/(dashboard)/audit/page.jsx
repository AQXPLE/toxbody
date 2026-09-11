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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <ShieldAlert className="h-3.5 w-3.5 text-tox-orange" />
            <span>Compliance & Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            System Audit Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Immutable administrative audit trail tracking logins, role modifications, bulk outreach commits, and migration batches.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-obsidian-900/90 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-tox-orange font-mono shadow-inner transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-white/[0.08] bg-obsidian-950/60 font-mono text-xs text-zinc-400 font-medium">
                <th className="py-3.5 px-6">Timestamp (CT)</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-6">Payload Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500 font-mono">
                    No audit log events recorded yet. Actions will appear automatically as team members log outreach or modify settings.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-mono text-zinc-400 text-[11px] font-medium">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary" size="xs" className="font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
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
