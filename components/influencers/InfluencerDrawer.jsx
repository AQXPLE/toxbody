'use client';

import React from 'react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';

export function InfluencerDrawer({ influencer, outreachHistory, accounts, employees, onClose }) {
  if (!influencer) return null;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Calculate distinct accounts contacted
  const contactedAccountIds = new Set(outreachHistory.map((o) => o.account_id));
  const repeatOutreaches = outreachHistory.filter((o) => o.is_repeat_same_account);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over Pane */}
      <div className="relative w-full max-w-2xl bg-[#121319] border-l border-zinc-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right-10 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-mono text-lg font-bold">
              @
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100 font-mono">
                  {influencer.instagram_handle}
                </h2>
                <a
                  href={influencer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {influencer.display_name || 'No display name recorded'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                Total Outreach
              </div>
              <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                {outreachHistory.length}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                Accounts Reached
              </div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {contactedAccountIds.size}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                Repeat Outreach
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {repeatOutreaches.length}
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Profile Metadata
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Primary Location</span>
                <span className="text-zinc-200 font-medium">
                  {influencer.city ? `${influencer.city}, ${influencer.state || 'USA'}` : 'Location unassigned'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Follower Count</span>
                <span className="text-zinc-200 font-mono">
                  {influencer.follower_count ? influencer.follower_count.toLocaleString() : 'Unenriched'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Niche / Focus</span>
                <span className="text-zinc-200 font-medium">{influencer.niche || 'General'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Meta Verification</span>
                <Badge variant={influencer.verified ? 'success' : 'default'} size="xs">
                  {influencer.verified ? 'Verified on Instagram' : 'External verification unavailable'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chronological Outreach Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Chronological Outreach History</span>
              <Badge variant="default" size="xs">
                {outreachHistory.length} Events
              </Badge>
            </h4>

            {outreachHistory.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs rounded-xl border border-zinc-800/80 bg-zinc-900/30">
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
                      className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">
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

                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span>Staff: {emp?.full_name || 'Historical / Unknown'}</span>
                        </div>
                        <div className="font-mono">
                          {event.outreach_date ? (
                            formatOutreachDate(event.outreach_date)
                          ) : (
                            <Badge variant="historical" size="xs">
                              Historical / Date unavailable
                            </Badge>
                          )}
                        </div>
                      </div>

                      {event.notes && (
                        <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 mt-1.5 font-sans">
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
  );
}
