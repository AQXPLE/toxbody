'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { DataModelExplainer } from '@/components/dashboard/DataModelExplainer.jsx';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';
import { InfluencerDrawer } from '@/components/influencers/InfluencerDrawer.jsx';
import { formatOutreachDate, formatShortDate } from '@/lib/utils.js';
import {
  Send,
  Users,
  Instagram,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentOutreach, setRecentOutreach] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Profile Viewers
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [activeMetaHandle, setActiveMetaHandle] = useState(null);

  // Active View Tab for Unified Data View
  const [activeDataTab, setActiveDataTab] = useState('OUTREACH'); // OUTREACH, INFLUENCERS, ACCOUNTS

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [m, outs, accs, emps, infs] = await Promise.all([
      db.getDashboardMetrics(),
      db.getOutreachRecords(),
      db.getAccounts(),
      db.getEmployees(),
      db.getInfluencers(),
    ]);
    setMetrics(m);
    setRecentOutreach(outs);
    setAccounts(accs);
    setEmployees(emps);
    setInfluencers(infs);
  };

  if (!metrics) {
    return (
      <div className="text-xs text-zinc-500 font-mono py-16 text-center space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
        <p>Loading The Tox Technique Operations Dashboard...</p>
      </div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const influencerMap = new Map(influencers.map((i) => [i.id, i]));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-tox-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-8 lg:p-10 lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-xs font-bold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Tox Technique Outreach Operations</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-tight">
              Multi-Account Instagram Outreach & Influencer Intelligence
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl">
              Logged in as <strong className="text-zinc-900">{currentUser?.full_name}</strong> ({currentUser?.role}). Fast handle submissions, automatic repeat detection, and cross-account marketing tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/outreach"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs shadow-tox-orange transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Log Outreach Batch</span>
              </Link>

              <Link
                href="/meta-search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-slate-50 text-zinc-900 font-bold text-xs shadow-2xs transition-all"
              >
                <Instagram className="h-4 w-4 text-[#ff5500]" />
                <span>Meta IG Explorer</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-52 lg:h-full relative overflow-hidden bg-zinc-950">
            <img
              src="/tox_outreach_hero.jpg"
              alt="The Tox Technique Outreach Platform"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Interactive Data Model Explainer (Solves confusion) */}
      <DataModelExplainer />

      {/* Primary KPI Metric Cards (White, Orange & Black) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-tox space-y-2 group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            <span>Outreach Today</span>
            <div className="h-7 w-7 rounded-lg bg-orange-50 text-[#ff5500] flex items-center justify-center">
              <Send className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-zinc-950">
            {metrics.outreachToday}
          </div>
          <div className="text-xs text-zinc-500">
            <strong className="text-zinc-800">{metrics.outreachThisWeek}</strong> logged this week
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-tox space-y-2 group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            <span>Master Influencers</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">
            {metrics.totalInfluencers}
          </div>
          <div className="text-xs text-zinc-500">
            <strong className="text-zinc-800">{metrics.uniqueInfluencersReached}</strong> reached across accounts
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-tox space-y-2 group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            <span>Active Accounts</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Instagram className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-zinc-900">
            {metrics.activeAccountsCount}
          </div>
          <div className="text-xs text-zinc-500">
            Across <strong className="text-zinc-800">{accounts.length}</strong> marketing handles
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-tox space-y-2 group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            <span>Same-Account Repeats</span>
            <div className="h-7 w-7 rounded-lg bg-orange-100 text-[#ff5500] flex items-center justify-center">
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#ff5500]">
            {metrics.repeatOutreachCount}
          </div>
          <div className="text-xs text-zinc-500">
            <strong className="text-zinc-800">{metrics.repeatRate}%</strong> repeat detection rate
          </div>
        </div>
      </div>

      {/* Unified Master Data Explorer (View All Data Clearly) */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-tox-md overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ff5500]" />
              <span>Unified Master Data Explorer</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Inspect all data records: Outreach Events, Master Influencer Profiles, and Accounts.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200 rounded-xl shadow-2xs">
            <button
              onClick={() => setActiveDataTab('OUTREACH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDataTab === 'OUTREACH'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Outreach Stream ({recentOutreach.length})
            </button>
            <button
              onClick={() => setActiveDataTab('INFLUENCERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDataTab === 'INFLUENCERS'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Master Influencers ({influencers.length})
            </button>
            <button
              onClick={() => setActiveDataTab('ACCOUNTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDataTab === 'ACCOUNTS'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Accounts ({accounts.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Outreach Stream */}
        {activeDataTab === 'OUTREACH' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse dense-table">
              <thead>
                <tr className="border-b border-zinc-200 bg-slate-50">
                  <th className="py-3 px-5">Influencer</th>
                  <th className="py-3 px-5">Marketing Account</th>
                  <th className="py-3 px-5">Logged By</th>
                  <th className="py-3 px-5">Date / Time</th>
                  <th className="py-3 px-5">Outreach Type</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">In-App IG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-sans">
                {recentOutreach.slice(0, 10).map((rec) => {
                  const inf = influencerMap.get(rec.influencer_id);
                  const acc = accountMap.get(rec.account_id);
                  const emp = employeeMap.get(rec.employee_id);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-orange-50/20 transition-colors group cursor-pointer"
                      onClick={() => inf && setSelectedInfluencer(inf)}
                    >
                      <td className="py-3 px-5">
                        <span className="font-mono font-bold text-zinc-900 group-hover:text-[#ff5500] transition-colors">
                          {inf?.instagram_handle || '@unknown'}
                        </span>
                      </td>

                      <td className="py-3 px-5 font-semibold text-zinc-800 text-xs">
                        {acc?.account_name || '—'}
                      </td>

                      <td className="py-3 px-5 text-xs text-zinc-600">
                        {emp?.full_name || 'Historical Import'}
                      </td>

                      <td className="py-3 px-5 font-mono text-xs text-zinc-600">
                        {rec.outreach_date ? (
                          formatOutreachDate(rec.outreach_date)
                        ) : (
                          <Badge variant="historical" size="xs">
                            Historical / Date unavailable
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-5">
                        {rec.is_repeat_same_account ? (
                          <Badge variant="repeat" size="xs">
                            <RotateCcw className="h-2.5 w-2.5" /> Same-Account Repeat (#{rec.repeat_count_for_account})
                          </Badge>
                        ) : (
                          <Badge variant="default" size="xs">
                            Outreach
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-5">
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

                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (inf) setActiveMetaHandle(inf.instagram_handle);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-orange-300 hover:bg-orange-50 text-[11px] font-bold text-zinc-700 hover:text-[#ff5500] transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Master Influencers */}
        {activeDataTab === 'INFLUENCERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse dense-table">
              <thead>
                <tr className="border-b border-zinc-200 bg-slate-50">
                  <th className="py-3 px-5">Creator Handle</th>
                  <th className="py-3 px-5">Display Name</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Followers</th>
                  <th className="py-3 px-5">Niche</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-sans">
                {influencers.slice(0, 10).map((inf) => (
                  <tr
                    key={inf.id}
                    onClick={() => setSelectedInfluencer(inf)}
                    className="hover:bg-orange-50/20 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-zinc-900 group-hover:text-[#ff5500]">
                        {inf.instagram_handle}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs text-zinc-700">
                      {inf.display_name || '—'}
                    </td>
                    <td className="py-3 px-5 text-xs text-zinc-600">
                      {inf.city ? `${inf.city}, ${inf.state || ''}` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-zinc-900 font-bold">
                      {inf.follower_count ? inf.follower_count.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-5 text-xs text-zinc-600">
                      {inf.niche || 'General'}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMetaHandle(inf.instagram_handle);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-[#ff5500] text-white text-[11px] font-bold transition-colors"
                      >
                        In-App IG
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Marketing Accounts */}
        {activeDataTab === 'ACCOUNTS' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const accOut = recentOutreach.filter((o) => o.account_id === acc.id);
              const repeats = accOut.filter((o) => o.is_repeat_same_account);

              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-orange-300 hover:shadow-tox transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 text-[#ff5500] flex items-center justify-center font-bold">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-zinc-900">{acc.account_name}</div>
                        <div className="text-[11px] font-mono text-zinc-500">@{acc.instagram_handle}</div>
                      </div>
                    </div>
                    <Badge variant="success" size="xs">Active</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] uppercase font-mono text-zinc-500">Outreach</div>
                      <div className="font-bold font-mono text-zinc-900 mt-0.5">{accOut.length}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] uppercase font-mono text-zinc-500">Repeats</div>
                      <div className="font-bold font-mono text-[#ff5500] mt-0.5">{repeats.length}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Influencer Drawer */}
      <InfluencerDrawer
        influencer={selectedInfluencer}
        outreachHistory={
          selectedInfluencer
            ? recentOutreach.filter((o) => o.influencer_id === selectedInfluencer.id)
            : []
        }
        accounts={accounts}
        employees={employees}
        onClose={() => setSelectedInfluencer(null)}
      />

      {/* Meta Instagram In-App Viewer Modal */}
      {activeMetaHandle && (
        <InstagramProfileViewer
          handle={activeMetaHandle}
          onClose={() => setActiveMetaHandle(null)}
        />
      )}
    </div>
  );
}
