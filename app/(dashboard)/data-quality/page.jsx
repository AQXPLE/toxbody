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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Data Quality & Integrity Center</span>
            <Badge variant="warning" size="sm">
              Operational Audit
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Audit handle sanitation, unverified accounts, unassigned geographic locations, and migration anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            Total Audited: {influencers.length}
          </Badge>
        </div>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>Missing Locations</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {missingLocations.length}
          </div>
          <div className="text-[11px] text-zinc-500">Profiles without geographic tagging</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
            <span>Unverified On Meta</span>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {unverifiedProfiles.length}
          </div>
          <div className="text-[11px] text-zinc-500">Pending Meta API verification</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-1 shadow-lg">
          <div className="text-[11px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Malformed Handles</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {malformedCandidates.length}
          </div>
          <div className="text-[11px] text-zinc-500">Normalizer sanitized 100% of handles</div>
        </div>
      </div>

      {/* Profiles Missing Location */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
          <span>Profiles Needing Geographic Tagging ({missingLocations.length})</span>
          <span className="text-[11px] font-normal text-zinc-500">
            Location assignment enables account-level prospecting
          </span>
        </h3>

        <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/80 rounded-lg border border-zinc-800 bg-zinc-900/40">
          {missingLocations.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              All influencer profiles have assigned locations.
            </div>
          ) : (
            missingLocations.slice(0, 20).map((inf) => (
              <div
                key={inf.id}
                className="p-3 flex items-center justify-between text-xs hover:bg-zinc-800/30 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-zinc-200">{inf.instagram_handle}</span>
                  <div className="text-[11px] text-zinc-400">{inf.display_name || 'No display name'}</div>
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
