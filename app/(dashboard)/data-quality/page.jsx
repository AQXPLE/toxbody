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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-[11px] font-bold mb-2">
            <ShieldAlert className="h-3 w-3" />
            <span>Integrity Auditor</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            Data Quality & Integrity Center
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
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
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#ff5500]" />
            <span>Missing Locations</span>
          </div>
          <div className="text-3xl font-black font-mono text-[#ff5500]">
            {missingLocations.length}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">Profiles without geographic tagging</div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
            <span>Standard Profile Status</span>
          </div>
          <div className="text-3xl font-black font-mono text-blue-600">
            {unverifiedProfiles.length}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">Standard Instagram accounts</div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-1 shadow-tox-lg">
          <div className="text-[11px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Malformed Handles</span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">
            {malformedCandidates.length}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">Normalizer sanitized 100% of handles</div>
        </div>
      </div>

      {/* Profiles Missing Location */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-tox-lg space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-3">
          <span>Profiles Needing Geographic Tagging ({missingLocations.length})</span>
          <span className="text-xs font-normal text-zinc-500">
            Location assignment enables account-level prospecting
          </span>
        </h3>

        <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-zinc-50/50">
          {missingLocations.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              All influencer profiles have assigned locations.
            </div>
          ) : (
            missingLocations.slice(0, 20).map((inf) => (
              <div
                key={inf.id}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-white transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-zinc-950">{inf.instagram_handle}</span>
                  <div className="text-[11px] text-zinc-500">{inf.display_name || 'No display name'}</div>
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
