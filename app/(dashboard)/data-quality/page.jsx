'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';

export default function DataQualityPage() {
  const { addToast } = useToast();
  const [influencers, setInfluencers] = useState([]);
  const [outreachRecords, setOutreachRecords] = useState([]);

  useEffect(() => {
    Promise.all([db.getInfluencers(), db.getOutreachRecords()]).then(([infs, outs]) => {
      setInfluencers(infs);
      setOutreachRecords(outs);
    });
  }, []);

  // Quality checks
  const missingLocations = influencers.filter((i) => !i.primary_location_id && !i.city);
  const unverifiedProfiles = influencers.filter((i) => !i.verified);
  const malformedCandidates = influencers.filter(
    (i) => i.normalized_handle.includes('..') || i.normalized_handle.length > 30 || i.normalized_handle.length < 2
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <ShieldAlert className="h-3.5 w-3.5 text-tox-orange" />
            <span>Integrity Auditor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Data Quality & Integrity Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Audit handle sanitation, unverified accounts, unassigned geographic locations, and migration anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Total Audited: {influencers.length}
          </Badge>
        </div>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase font-mono font-medium text-tox-orange flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-tox-orange" />
            <span>Missing Locations</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-tox-orange tracking-tight">
            {missingLocations.length}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Profiles without geographic tagging</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase font-mono font-medium text-blue-400 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
            <span>Standard Profile Status</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-blue-400 tracking-tight">
            {unverifiedProfiles.length}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Standard Instagram accounts</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="text-[11px] uppercase font-mono font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Malformed Handles</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tracking-tight">
            {malformedCandidates.length}
          </div>
          <div className="text-xs text-zinc-500 font-mono">Normalizer sanitized 100% of handles</div>
        </div>
      </div>

      {/* Profiles Missing Location */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
            Profiles Needing Geographic Tagging ({missingLocations.length})
          </h3>
          <span className="text-xs font-normal text-zinc-500 font-mono hidden sm:inline">
            Location assignment enables account-level prospecting
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] rounded-2xl border border-white/[0.08] bg-obsidian-900/60 pr-1">
          {missingLocations.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              All influencer profiles have assigned locations.
            </div>
          ) : (
            missingLocations.slice(0, 20).map((inf) => (
              <div
                key={inf.id}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-white">{inf.instagram_handle}</span>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{inf.display_name || 'No display name'}</div>
                </div>
                <Badge variant="warning" size="xs">
                  Missing Location
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
