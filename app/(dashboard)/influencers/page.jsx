'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db/provider.js';
import { InfluencerDrawer } from '@/components/influencers/InfluencerDrawer.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { FilterChip } from '@/components/ui/FilterChip.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { formatShortDate, downloadAsCsv } from '@/lib/utils.js';
import {
  Search,
  Filter,
  Users,
  Copy,
  Download,
  CheckSquare,
  Square,
  ExternalLink,
  RotateCcw,
  Sparkles,
  MapPin,
  Instagram,
  CheckCircle2,
} from 'lucide-react';

export default function InfluencersPage() {
  const searchParams = useSearchParams();
  const initialHandle = searchParams.get('handle');
  const { addToast } = useToast();

  const [influencers, setInfluencers] = useState([]);
  const [outreachRecords, setOutreachRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialHandle || '');
  const [selectedLocationId, setSelectedLocationId] = useState('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState('ALL');
  const [contactStatusFilter, setContactStatusFilter] = useState('ALL'); // ALL, NEVER_CONTACTED, CONTACTED_THIS_ACCOUNT, CONTACTED_OTHER_ACCOUNT
  const [repeatOnly, setRepeatOnly] = useState(false);

  // Selected influencer for slide-over drawer
  const [activeInfluencer, setActiveInfluencer] = useState(null);

  // Prospecting multi-select
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [infList, outList, accList, locList, empList] = await Promise.all([
      db.getInfluencers(),
      db.getOutreachRecords(),
      db.getAccounts(),
      db.getLocations(),
      db.getEmployees(),
    ]);
    setInfluencers(infList);
    setOutreachRecords(outList);
    setAccounts(accList);
    setLocations(locList);
    setEmployees(empList);

    if (initialHandle) {
      const match = infList.find((i) => i.normalized_handle === initialHandle.toLowerCase());
      if (match) setActiveInfluencer(match);
    }
  };

  // Group outreach by influencer
  const outreachByInfluencer = useMemo(() => {
    const map = new Map();
    for (const out of outreachRecords) {
      if (!map.has(out.influencer_id)) map.set(out.influencer_id, []);
      map.get(out.influencer_id).push(out);
    }
    return map;
  }, [outreachRecords]);

  // Map locations by ID
  const locationMap = useMemo(() => {
    return new Map(locations.map((l) => [l.id, l]));
  }, [locations]);

  // Account map
  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a]));
  }, [accounts]);

  // Filtered influencers calculation
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((inf) => {
      const history = outreachByInfluencer.get(inf.id) || [];
      const sameAccountOutreaches = selectedAccountId !== 'ALL'
        ? history.filter((o) => o.account_id === selectedAccountId)
        : [];
      const otherAccountOutreaches = selectedAccountId !== 'ALL'
        ? history.filter((o) => o.account_id !== selectedAccountId)
        : [];

      // Contact status filter relative to selected account
      if (contactStatusFilter === 'NEVER_CONTACTED_SELECTED' && selectedAccountId !== 'ALL') {
        if (sameAccountOutreaches.length > 0) return false;
      }
      if (contactStatusFilter === 'CONTACTED_SELECTED' && selectedAccountId !== 'ALL') {
        if (sameAccountOutreaches.length === 0) return false;
      }
      if (contactStatusFilter === 'CONTACTED_OTHER_ONLY' && selectedAccountId !== 'ALL') {
        if (sameAccountOutreaches.length > 0 || otherAccountOutreaches.length === 0) return false;
      }

      // Repeat filter
      if (repeatOnly) {
        const hasRepeat = history.some((o) => o.is_repeat_same_account);
        if (!hasRepeat) return false;
      }

      // Location filter
      if (selectedLocationId !== 'ALL' && inf.primary_location_id !== selectedLocationId) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
        const handleMatch = inf.normalized_handle.includes(q);
        const nameMatch = inf.display_name?.toLowerCase().includes(q);
        const cityMatch = inf.city?.toLowerCase().includes(q);
        const nicheMatch = inf.niche?.toLowerCase().includes(q);
        if (!handleMatch && !nameMatch && !cityMatch && !nicheMatch) return false;
      }

      return true;
    });
  }, [
    influencers,
    searchQuery,
    selectedLocationId,
    selectedAccountId,
    contactStatusFilter,
    repeatOnly,
    outreachByInfluencer,
  ]);

  // Prospecting Prospect Stats for Account
  const prospectingStats = useMemo(() => {
    if (selectedAccountId === 'ALL') return null;
    const targetAcc = accountMap.get(selectedAccountId);
    let neverCount = 0;
    let otherAccountsCount = 0;
    let sameAccountCount = 0;

    for (const inf of influencers) {
      const history = outreachByInfluencer.get(inf.id) || [];
      const thisAcc = history.filter((o) => o.account_id === selectedAccountId);
      const otherAcc = history.filter((o) => o.account_id !== selectedAccountId);

      if (thisAcc.length > 0) {
        sameAccountCount++;
      } else if (otherAcc.length > 0) {
        otherAccountsCount++;
      } else {
        neverCount++;
      }
    }

    return {
      accountName: targetAcc?.account_name || 'Selected Account',
      total: influencers.length,
      neverCount,
      otherAccountsCount,
      sameAccountCount,
    };
  }, [selectedAccountId, influencers, outreachByInfluencer, accountMap]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInfluencers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInfluencers.map((i) => i.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopyHandles = () => {
    const selectedHandles = filteredInfluencers
      .filter((i) => selectedIds.has(i.id))
      .map((i) => i.instagram_handle)
      .join('\n');

    if (!selectedHandles) return;
    navigator.clipboard.writeText(selectedHandles);
    addToast({
      title: 'Handles Copied to Clipboard',
      message: `Copied ${selectedIds.size} handles ready for outreach.`,
      type: 'success',
    });
  };

  const handleExportCsv = () => {
    const rows = filteredInfluencers
      .filter((i) => (selectedIds.size > 0 ? selectedIds.has(i.id) : true))
      .map((i) => ({
        Handle: i.instagram_handle,
        DisplayName: i.display_name || '',
        Location: i.city ? `${i.city}, ${i.state || ''}` : '',
        Followers: i.follower_count || 0,
        Niche: i.niche || '',
        InstagramUrl: i.instagram_url || '',
        TotalOutreach: (outreachByInfluencer.get(i.id) || []).length,
      }));

    downloadAsCsv('tox_influencer_prospects', rows);
    addToast({
      title: 'CSV Export Generated',
      message: `Exported ${rows.length} influencer records.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Master Influencer Directory & Prospecting</span>
            <Badge variant="default" size="sm">
              {influencers.length} Total Profiles
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global search, location-based targeting, cross-account reachout intelligence, and handle prospecting.
          </p>
        </div>

        {/* Bulk Action Bar if items selected */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 animate-in fade-in-50">
              <span className="text-xs font-semibold text-amber-400 font-mono">
                {selectedIds.size} Selected
              </span>
              <button
                onClick={handleCopyHandles}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded text-xs font-bold transition-all shadow"
              >
                <Copy className="h-3 w-3" />
                Copy Handles
              </button>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Account Prospecting Insight Card (e.g. Sugarland Scenario) */}
      {prospectingStats && (
        <div className="rounded-xl border border-amber-500/30 bg-[#14141a] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Target Account Prospecting: {prospectingStats.accountName}</span>
            </h3>
            <span className="text-[11px] text-zinc-400">
              Cross-account intelligence breakdown for mass reachout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setContactStatusFilter('NEVER_CONTACTED_SELECTED')}
              className={`p-3 rounded-lg border text-left transition-all ${
                contactStatusFilter === 'NEVER_CONTACTED_SELECTED'
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-zinc-400">Never Contacted</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {prospectingStats.neverCount}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Fresh prospects for this account</div>
            </button>

            <button
              onClick={() => setContactStatusFilter('CONTACTED_OTHER_ONLY')}
              className={`p-3 rounded-lg border text-left transition-all ${
                contactStatusFilter === 'CONTACTED_OTHER_ONLY'
                  ? 'border-blue-500/50 bg-blue-950/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-zinc-400">Contacted via Other Accounts</div>
              <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                {prospectingStats.otherAccountsCount}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Reachable without same-account repeat</div>
            </button>

            <button
              onClick={() => setContactStatusFilter('CONTACTED_SELECTED')}
              className={`p-3 rounded-lg border text-left transition-all ${
                contactStatusFilter === 'CONTACTED_SELECTED'
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-zinc-400">Already Contacted by This Account</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                {prospectingStats.sameAccountCount}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">New outreach will be flagged as repeat</div>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handle, name, city, niche..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Account Prospecting Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Instagram className="h-3 w-3 text-amber-400" /> Account:
            </span>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setContactStatusFilter('ALL');
              }}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Marketing Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-zinc-400" /> Location:
            </span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city}, {loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* Repeats Only Toggle */}
          <button
            type="button"
            onClick={() => setRepeatOnly(!repeatOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              repeatOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Has Repeat History</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {(selectedAccountId !== 'ALL' || selectedLocationId !== 'ALL' || contactStatusFilter !== 'ALL' || repeatOnly || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-500">Active Filters:</span>
            {selectedAccountId !== 'ALL' && (
              <FilterChip
                label="Target Account"
                value={accountMap.get(selectedAccountId)?.account_name}
                onRemove={() => {
                  setSelectedAccountId('ALL');
                  setContactStatusFilter('ALL');
                }}
              />
            )}
            {contactStatusFilter !== 'ALL' && (
              <FilterChip
                label="Contact Status"
                value={
                  contactStatusFilter === 'NEVER_CONTACTED_SELECTED'
                    ? 'Never Contacted'
                    : contactStatusFilter === 'CONTACTED_OTHER_ONLY'
                    ? 'Other Accounts Only'
                    : 'Already Contacted'
                }
                onRemove={() => setContactStatusFilter('ALL')}
              />
            )}
            {selectedLocationId !== 'ALL' && (
              <FilterChip
                label="Location"
                value={locationMap.get(selectedLocationId)?.name}
                onRemove={() => setSelectedLocationId('ALL')}
              />
            )}
            {repeatOnly && (
              <FilterChip
                label="Repeat"
                value="Only With Repeats"
                onRemove={() => setRepeatOnly(false)}
              />
            )}
            {searchQuery && (
              <FilterChip
                label="Search"
                value={searchQuery}
                onRemove={() => setSearchQuery('')}
              />
            )}
          </div>
        )}
      </div>

      {/* Influencer Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-zinc-200">
                    {selectedIds.size === filteredInfluencers.length && filteredInfluencers.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Influencer Handle</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Outreach Count</th>
                <th className="py-3 px-4">Accounts Contacted</th>
                <th className="py-3 px-4">Last Outreach</th>
                <th className="py-3 px-4">Repeat Count</th>
                <th className="py-3 px-4">Meta Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredInfluencers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-zinc-500">
                    No influencers found matching the active search or filters.
                  </td>
                </tr>
              ) : (
                filteredInfluencers.map((inf) => {
                  const history = outreachByInfluencer.get(inf.id) || [];
                  const contactedAccIds = new Set(history.map((o) => o.account_id));
                  const repeats = history.filter((o) => o.is_repeat_same_account);
                  const isSelected = selectedIds.has(inf.id);

                  // Latest outreach date
                  const latestOutreach = history[0];

                  return (
                    <tr
                      key={inf.id}
                      onClick={() => setActiveInfluencer(inf)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-800/40 group ${
                        isSelected ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Checkbox for Prospecting */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(inf.id);
                        }}
                      >
                        <button className="text-zinc-500 hover:text-zinc-200">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-amber-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Handle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                            {inf.instagram_handle}
                          </span>
                          <a
                            href={inf.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-500 hover:text-amber-400 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      {/* Display Name */}
                      <td className="py-3 px-4 text-zinc-300 text-xs">
                        {inf.display_name || '—'}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-zinc-400 text-xs">
                        {inf.city ? `${inf.city}, ${inf.state || ''}` : '—'}
                      </td>

                      {/* Followers */}
                      <td className="py-3 px-4 text-zinc-300 font-mono text-xs">
                        {inf.follower_count ? inf.follower_count.toLocaleString() : '—'}
                      </td>

                      {/* Outreach Count */}
                      <td className="py-3 px-4 text-zinc-200 font-mono text-xs">
                        {history.length}
                      </td>

                      {/* Accounts Contacted */}
                      <td className="py-3 px-4">
                        {contactedAccIds.size > 0 ? (
                          <Badge variant={contactedAccIds.size > 1 ? 'cross' : 'default'} size="xs">
                            {contactedAccIds.size} Account{contactedAccIds.size > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs">Never</span>
                        )}
                      </td>

                      {/* Last Outreach */}
                      <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                        {latestOutreach ? (
                          latestOutreach.outreach_date ? (
                            formatShortDate(latestOutreach.outreach_date)
                          ) : (
                            <Badge variant="historical" size="xs">
                              Historical
                            </Badge>
                          )
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Repeat Count */}
                      <td className="py-3 px-4">
                        {repeats.length > 0 ? (
                          <Badge variant="repeat" size="xs">
                            <RotateCcw className="h-2.5 w-2.5" /> {repeats.length} Repeat{repeats.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs">0</span>
                        )}
                      </td>

                      {/* Meta Verification */}
                      <td className="py-3 px-4">
                        {inf.verified ? (
                          <Badge variant="success" size="xs">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Unverified</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Influencer Slide-over Detail Drawer */}
      <InfluencerDrawer
        influencer={activeInfluencer}
        outreachHistory={activeInfluencer ? outreachByInfluencer.get(activeInfluencer.id) || [] : []}
        accounts={accounts}
        employees={employees}
        onClose={() => setActiveInfluencer(null)}
      />
    </div>
  );
}
