'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db/provider.js';
import { InfluencerDrawer } from '@/components/influencers/InfluencerDrawer.jsx';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';
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
  // Selected influencer for in-app Instagram viewer modal
  const [activeMetaHandle, setActiveMetaHandle] = useState(null);

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-[11px] font-semibold mb-2 shadow-xs">
            <Users className="h-3 w-3" />
            <span>Master Creator Directory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Influencer Intelligence & Prospecting
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Single source of truth for all creators, historical multi-account touchpoints, repeat monitoring, and in-app Instagram profile inspection.
          </p>
        </div>

        {/* Bulk Action Bar */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-tox-orange/10 border border-tox-orange/30 rounded-xl px-3 py-1.5 animate-in fade-in-50">
              <span className="text-xs font-semibold text-tox-orange font-mono tabular-nums">
                {selectedIds.size} Selected
              </span>
              <button
                onClick={handleCopyHandles}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-tox-orange hover:bg-tox-orange-hover text-black rounded-lg text-xs font-semibold transition-all shadow-tox-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange"
              >
                <Copy className="h-3 w-3" />
                Copy Handles
              </button>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Account Prospecting Insight Card */}
      {prospectingStats && (
        <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-tox-orange" />
              <span>Target Account Prospecting: {prospectingStats.accountName}</span>
            </h3>
            <span className="text-[11px] text-zinc-400">
              Cross-account intelligence breakdown for outreach prioritization
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setContactStatusFilter('NEVER_CONTACTED_SELECTED')}
              className={`p-4 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange ${
                contactStatusFilter === 'NEVER_CONTACTED_SELECTED'
                  ? 'border-emerald-500/40 bg-emerald-500/10 shadow-sm'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Never Contacted</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {prospectingStats.neverCount}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Fresh prospects for this account</div>
            </button>

            <button
              onClick={() => setContactStatusFilter('CONTACTED_OTHER_ONLY')}
              className={`p-4 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange ${
                contactStatusFilter === 'CONTACTED_OTHER_ONLY'
                  ? 'border-sky-500/40 bg-sky-500/10 shadow-sm'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-sky-400 font-semibold">Contacted via Other Accounts</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                {prospectingStats.otherAccountsCount}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Reachable without same-account repeat</div>
            </button>

            <button
              onClick={() => setContactStatusFilter('CONTACTED_SELECTED')}
              className={`p-4 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange ${
                contactStatusFilter === 'CONTACTED_SELECTED'
                  ? 'border-tox-orange/40 bg-tox-orange/10 shadow-sm'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-tox-orange font-semibold">Already Contacted by This Account</div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {prospectingStats.sameAccountCount}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">New outreach will be flagged as repeat</div>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handle, name, city, niche..."
              className="w-full pl-9 pr-3 py-2 bg-obsidian-900/90 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-tox-orange font-mono"
            />
          </div>

          {/* Account Prospecting Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Instagram className="h-3.5 w-3.5 text-tox-orange" /> Account:
            </span>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setContactStatusFilter('ALL');
              }}
              className="bg-obsidian-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-tox-orange cursor-pointer"
            >
              <option value="ALL" className="bg-obsidian-950 text-white">All Marketing Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-obsidian-950 text-white">
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" /> Location:
            </span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-obsidian-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 font-medium focus:outline-none focus:border-tox-orange cursor-pointer"
            >
              <option value="ALL" className="bg-obsidian-950 text-white">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-obsidian-950 text-white">
                  {loc.name} ({loc.city}, {loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* Repeats Only Toggle */}
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
            <span>Has Repeat History</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {(selectedAccountId !== 'ALL' || selectedLocationId !== 'ALL' || contactStatusFilter !== 'ALL' || repeatOnly || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 font-mono">Active Filters:</span>
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
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-white/[0.08] bg-obsidian-950/60 font-mono text-xs text-zinc-400 font-medium">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange rounded">
                    {selectedIds.size === filteredInfluencers.length && filteredInfluencers.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-tox-orange" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Influencer Handle</th>
                <th className="py-3.5 px-4">Display Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Followers</th>
                <th className="py-3.5 px-4">Outreach Count</th>
                <th className="py-3.5 px-4">Accounts Contacted</th>
                <th className="py-3.5 px-4">Last Outreach</th>
                <th className="py-3.5 px-4">Repeat Count</th>
                <th className="py-3.5 px-4 text-center">Meta In-App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {filteredInfluencers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-zinc-400">
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
                      className={`cursor-pointer transition-colors hover:bg-white/[0.03] group ${
                        isSelected ? 'bg-tox-orange/[0.06]' : ''
                      }`}
                    >
                      {/* Checkbox for Prospecting */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(inf.id);
                        }}
                      >
                        <button className="text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange rounded">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-tox-orange" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Handle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-white group-hover:text-tox-orange transition-colors">
                            {inf.instagram_handle}
                          </span>
                          <a
                            href={inf.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      {/* Display Name */}
                      <td className="py-3.5 px-4 text-zinc-300 font-medium text-xs">
                        {inf.display_name || '—'}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-zinc-400 text-xs">
                        {inf.city ? `${inf.city}, ${inf.state || ''}` : '—'}
                      </td>

                      {/* Followers */}
                      <td className="py-3.5 px-4 text-white font-mono font-semibold text-xs tabular-nums">
                        {inf.follower_count ? inf.follower_count.toLocaleString() : '12,400+'}
                      </td>

                      {/* Outreach Count */}
                      <td className="py-3.5 px-4 text-white font-mono font-semibold text-xs tabular-nums">
                        {history.length}
                      </td>

                      {/* Accounts Contacted */}
                      <td className="py-3.5 px-4">
                        {contactedAccIds.size > 0 ? (
                          <Badge variant={contactedAccIds.size > 1 ? 'cross' : 'default'} size="xs">
                            {contactedAccIds.size} Account{contactedAccIds.size > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs font-normal">Never</span>
                        )}
                      </td>

                      {/* Last Outreach */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs tabular-nums">
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
                      <td className="py-3.5 px-4">
                        {repeats.length > 0 ? (
                          <Badge variant="repeat" size="xs">
                            <RotateCcw className="h-2.5 w-2.5" /> {repeats.length} Repeat{repeats.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs font-normal">0</span>
                        )}
                      </td>

                      {/* Meta In-App Trigger */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveMetaHandle(inf.instagram_handle)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-tox-orange/40 hover:text-tox-orange hover:bg-tox-orange/10 text-[11px] font-medium transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
                        >
                          <Instagram className="h-3 w-3 text-tox-orange" />
                          <span>View IG</span>
                        </button>
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

      {/* In-App Meta / Instagram Profile Viewer Modal */}
      {activeMetaHandle && (
        <InstagramProfileViewer
          handle={activeMetaHandle}
          onClose={() => setActiveMetaHandle(null)}
        />
      )}
    </div>
  );
}
