'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Instagram,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';

export function InfluencerDrawer({ influencer, outreachHistory, accounts, employees, onClose }) {
  const [showMetaViewer, setShowMetaViewer] = useState(false);

  if (!influencer) return null;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Calculate distinct accounts contacted
  const contactedAccountIds = new Set(outreachHistory.map((o) => o.account_id));
  const repeatOutreaches = outreachHistory.filter((o) => o.is_repeat_same_account);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

        {/* Slide-over Pane */}
        <div className="relative w-full max-w-2xl bg-white border-l border-zinc-200 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right-10 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ff5500] to-orange-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                @
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-zinc-950 font-mono">
                    {influencer.instagram_handle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowMetaViewer(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] hover:bg-orange-100 text-[11px] font-bold transition-colors"
                  >
                    <Instagram className="h-3 w-3" />
                    <span>In-App Meta View</span>
                  </button>
                  <a
                    href={influencer.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                    title="Open on official Instagram"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 font-medium">
                  {influencer.display_name || 'No display name recorded'}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Action Banner to In-App Instagram Viewer */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ff5500] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Instagram className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950">In-App Instagram Meta Profile</h4>
                  <p className="text-[11px] text-zinc-600">Inspect posts, followers, engagement, and log outreach.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaViewer(true)}
                className="px-4 py-2 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs shadow-tox-orange transition-all shrink-0"
              >
                Launch Profile
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  Total Outreach
                </div>
                <div className="text-2xl font-black font-mono text-zinc-950 mt-1">
                  {outreachHistory.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  Accounts Reached
                </div>
                <div className="text-2xl font-black font-mono text-blue-600 mt-1">
                  {contactedAccountIds.size}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  Repeat Outreach
                </div>
                <div className="text-2xl font-black font-mono text-[#ff5500] mt-1">
                  {repeatOutreaches.length}
                </div>
              </div>
            </div>

            {/* Profile Details Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Profile Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Primary Location</span>
                  <span className="text-zinc-900 font-bold">
                    {influencer.city ? `${influencer.city}, ${influencer.state || 'USA'}` : 'Location unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Estimated Followers</span>
                  <span className="text-zinc-900 font-mono font-bold">
                    {influencer.follower_count ? influencer.follower_count.toLocaleString() : '12,400+'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Niche / Focus</span>
                  <span className="text-zinc-900 font-bold">{influencer.niche || 'Wellness & Body'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Meta Status</span>
                  <Badge variant={influencer.verified ? 'success' : 'default'} size="xs">
                    {influencer.verified ? 'Verified on Instagram' : 'Active Account'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Chronological Outreach Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between">
                <span>Chronological Outreach Touchpoints</span>
                <Badge variant="primary" size="xs">
                  {outreachHistory.length} Events
                </Badge>
              </h4>

              {outreachHistory.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs rounded-2xl border border-zinc-200 bg-zinc-50">
                  No outreach has been logged for this influencer yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {outreachHistory.map((event, idx) => {
                    const acc = accountMap.get(event.account_id);
                    const emp = employeeMap.get(event.employee_id);

                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2 hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-950">
                              Account: {acc?.account_name || 'Marketing Account'}
                            </span>
                            {event.is_repeat_same_account ? (
                              <Badge variant="repeat" size="xs">
                                <RotateCcw className="h-2.5 w-2.5" /> Repeat #{event.repeat_count_for_account}
                              </Badge>
                            ) : (
                              <Badge variant="default" size="xs">
                                Standard Touchpoint
                              </Badge>
                            )}
                          </div>

                          <Badge
                            variant={
                              event.status === 'Replied' || event.status === 'Interested'
                                ? 'success'
                                : event.status === 'Follow-up'
                                ? 'warning'
                                : 'info'
                            }
                            size="xs"
                          >
                            {event.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <div>
                            <span>Staff: </span>
                            <strong className="text-zinc-700">{emp?.full_name || 'Historical / Unknown'}</strong>
                          </div>
                          <div className="font-mono font-medium text-zinc-600">
                            {event.outreach_date ? (
                              formatOutreachDate(event.outreach_date)
                            ) : (
                              <Badge variant="historical" size="xs">
                                Historical
                              </Badge>
                            )}
                          </div>
                        </div>

                        {event.notes && (
                          <div className="text-xs text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200 mt-1.5 font-sans">
                            {event.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* In-App Meta / Instagram Profile Viewer Modal */}
      {showMetaViewer && (
        <InstagramProfileViewer
          handle={influencer.instagram_handle}
          onClose={() => setShowMetaViewer(false)}
        />
      )}
    </>
  );
}
