'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';
import {
  ArrowLeft,
  Instagram,
  ExternalLink,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Share2,
  Sparkles,
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
  const [showMetaViewer, setShowMetaViewer] = useState(false);

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
      <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
        <p>Loading influencer profile...</p>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="text-zinc-600 text-sm font-semibold">Influencer record not found.</div>
        <Link
          href="/influencers"
          className="text-[#ff5500] hover:underline text-xs inline-flex items-center gap-1 font-bold"
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-tox-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#ff5500] to-orange-400 text-white flex items-center justify-center font-black text-2xl shadow-md">
              @
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-zinc-950 font-mono">
                  {influencer.instagram_handle}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowMetaViewer(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] hover:bg-orange-100 text-xs font-bold transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>Launch In-App IG Profile</span>
                </button>
                <a
                  href={influencer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-medium">
                {influencer.display_name || 'No display name recorded'} • {influencer.city ? `${influencer.city}, ${influencer.state || 'USA'}` : 'Location unassigned'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={influencer.verified ? 'success' : 'default'} size="sm">
              {influencer.verified ? 'Verified Creator' : 'Standard Profile'}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Outreach</div>
            <div className="text-2xl font-black font-mono text-zinc-950 mt-1">{outreachHistory.length}</div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Accounts Contacted</div>
            <div className="text-2xl font-black font-mono text-blue-600 mt-1">{contactedAccountIds.size}</div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Repeat Outreaches</div>
            <div className="text-2xl font-black font-mono text-[#ff5500] mt-1">{repeats.length}</div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Estimated Followers</div>
            <div className="text-2xl font-black font-mono text-zinc-900 mt-1">
              {influencer.follower_count ? influencer.follower_count.toLocaleString() : '12,400+'}
            </div>
          </div>
        </div>
      </div>

      {/* Outreach History Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-5 shadow-tox-lg">
        <h2 className="text-base font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-4">
          <span>Chronological Outreach Timeline</span>
          <Badge variant="primary" size="xs">
            {outreachHistory.length} Total Touchpoints
          </Badge>
        </h2>

        {outreachHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
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
                  className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-950">
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
                    <Badge
                      variant={
                        item.status === 'Replied' || item.status === 'Interested'
                          ? 'success'
                          : item.status === 'Follow-up'
                          ? 'warning'
                          : 'info'
                      }
                      size="xs"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div>
                      <span>Staff: </span>
                      <strong className="text-zinc-800">{emp?.full_name || 'Historical Import'}</strong>
                    </div>
                    <div className="font-mono font-medium text-zinc-600">
                      {item.outreach_date ? (
                        formatOutreachDate(item.outreach_date)
                      ) : (
                        <Badge variant="historical" size="xs">
                          Historical
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-xs text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200 mt-1.5">
                      {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-App Meta / Instagram Profile Viewer Modal */}
      {showMetaViewer && (
        <InstagramProfileViewer
          handle={influencer.instagram_handle}
          onClose={() => setShowMetaViewer(false)}
        />
      )}
    </div>
  );
}
