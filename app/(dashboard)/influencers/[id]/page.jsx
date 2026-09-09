'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';
import {
  ArrowLeft,
  Instagram,
  ExternalLink,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function InfluencerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [influencer, setInfluencer] = useState(null);
  const [outreachHistory, setOutreachHistory] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [inf, allOutreach, accs, emps] = await Promise.all([
        db.getInfluencerById(id),
        db.getOutreachRecords({ influencer_id: id }),
        db.getAccounts(),
        db.getEmployees(),
      ]);
      setInfluencer(inf);
      setOutreachHistory(allOutreach);
      setAccounts(accs);
      setEmployees(emps);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-zinc-500 font-mono">
        Loading influencer dossier...
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="text-zinc-400 text-sm">Influencer record not found.</div>
        <Link
          href="/influencers"
          className="text-amber-400 hover:underline text-xs inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Influencer Directory
        </Link>
      </div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const contactedAccountIds = new Set(outreachHistory.map((o) => o.account_id));
  const repeats = outreachHistory.filter((o) => o.is_repeat_same_account);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/influencers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-mono text-xl font-bold">
              @
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-zinc-100 font-mono">
                  {influencer.instagram_handle}
                </h1>
                <a
                  href={influencer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {influencer.display_name || 'No display name recorded'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={influencer.verified ? 'success' : 'default'} size="sm">
              {influencer.verified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Total Outreach</div>
            <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">{outreachHistory.length}</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Accounts Contacted</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{contactedAccountIds.size}</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Repeat Outreaches</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{repeats.length}</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Followers</div>
            <div className="text-2xl font-bold font-mono text-zinc-200 mt-1">
              {influencer.follower_count ? influencer.follower_count.toLocaleString() : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Outreach History Section */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center justify-between">
          <span>Complete Historical Outreach Timeline</span>
          <Badge variant="default" size="xs">
            {outreachHistory.length} Total Touchpoints
          </Badge>
        </h2>

        {outreachHistory.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-500">
            No outreach recorded for this influencer yet.
          </div>
        ) : (
          <div className="space-y-3">
            {outreachHistory.map((item) => {
              const acc = accountMap.get(item.account_id);
              const emp = employeeMap.get(item.employee_id);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">
                        Account: {acc?.account_name || 'Marketing Account'}
                      </span>
                      {item.is_repeat_same_account ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> Same-Account Repeat (#{item.repeat_count_for_account})
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          Standard Touchpoint
                        </Badge>
                      )}
                    </div>
                    <Badge variant="info" size="xs">
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <div>Staff: {emp?.full_name || 'Historical Import'}</div>
                    <div className="font-mono">
                      {item.outreach_date ? (
                        formatOutreachDate(item.outreach_date)
                      ) : (
                        <Badge variant="historical" size="xs">
                          Historical / Date unavailable
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 mt-1">
                      {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
