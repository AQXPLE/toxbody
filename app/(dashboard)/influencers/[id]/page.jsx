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
  Send,
  MapPin,
  Heart,
  MessageCircle,
  Globe,
  Layers,
  Copy,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast.jsx';

export default function InfluencerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { addToast } = useToast();

  const [influencer, setInfluencer] = useState(null);
  const [outreachHistory, setOutreachHistory] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Meta Profile state
  const [liveProfile, setLiveProfile] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});
  const [showMetaViewer, setShowMetaViewer] = useState(false);

  useEffect(() => {
    async function load() {
      try {
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

        // If influencer found, query real live Meta profile
        if (inf?.instagram_handle) {
          fetchLiveMeta(inf.instagram_handle);
        }
      } catch (err) {
        console.error('Error loading influencer detail:', err);
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const fetchLiveMeta = async (rawHandle) => {
    setLoadingLive(true);
    try {
      const clean = rawHandle.replace(/^@/, '').trim();
      const res = await fetch(`/api/meta/profile?handle=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data?.profile) {
        setLiveProfile(data.profile);
      }
    } catch (e) {
      console.error('Error fetching live Meta profile for detail page:', e);
    } finally {
      setLoadingLive(false);
    }
  };

  const handleImageError = (key, originalUrl) => {
    if (!imageErrorMap[key]) {
      setImageErrorMap((prev) => ({
        ...prev,
        [key]: `/api/meta/proxy-image?url=${encodeURIComponent(originalUrl)}`,
      }));
    }
  };

  const handleCopyHandle = () => {
    if (!influencer) return;
    navigator.clipboard.writeText(influencer.instagram_handle);
    addToast({
      title: 'Handle Copied',
      message: `${influencer.instagram_handle} copied to clipboard.`,
      type: 'success',
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 max-w-5xl mx-auto">
        <div className="h-8 w-8 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-zinc-600 font-mono">Loading influencer dossier...</p>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="py-16 text-center space-y-4 max-w-5xl mx-auto">
        <div className="text-zinc-700 text-sm font-bold">Influencer record not found.</div>
        <Link
          href="/influencers"
          className="text-[#ff5500] hover:underline text-xs inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Influencer Directory
        </Link>
      </div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const contactedAccountIds = new Set(outreachHistory.map((o) => o.account_id));
  const repeats = outreachHistory.filter((o) => o.is_repeat_same_account);

  const displayFollowers = liveProfile?.followerCount || (influencer.follower_count ? influencer.follower_count.toLocaleString() : '12,400+');
  const displayBio = liveProfile?.bio || influencer.bio || `Content creator • Lifestyle & Aesthetics`;
  const displayName = liveProfile?.displayName || influencer.display_name || influencer.instagram_handle;
  const isVerified = liveProfile ? liveProfile.verified : !!influencer.verified;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/influencers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Influencer Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyHandle}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5 text-[#ff5500]" />
            <span>Copy Handle</span>
          </button>
          <button
            onClick={() => router.push(`/outreach`)}
            className="px-4 py-1.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Log Outreach</span>
          </button>
        </div>
      </div>

      {/* Main Profile Dossier Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-tox-lg space-y-6">
        {/* Profile Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6">
          <div className="flex items-center gap-5">
            {/* Real Avatar with Story Ring */}
            <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-sm">
              <div className="p-0.5 bg-white rounded-full">
                {liveProfile?.avatarUrl ? (
                  <img
                    src={imageErrorMap['detail-avatar'] || liveProfile.avatarUrl}
                    onError={() => handleImageError('detail-avatar', liveProfile.avatarUrl)}
                    referrerPolicy="no-referrer"
                    alt={influencer.instagram_handle}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-inner"
                  />
                ) : (
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-[#ff5500] to-orange-400 text-white flex items-center justify-center font-black text-3xl shadow-md">
                    @
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
                  {influencer.instagram_handle}
                </h1>
                {isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-sky-500 fill-sky-500" title="Verified Creator on Meta" />
                )}
                {liveProfile?.isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Meta Data
                  </span>
                )}
                {loadingLive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#ff5500] text-xs font-bold animate-pulse">
                    Connecting to Meta...
                  </span>
                )}
              </div>

              <div className="text-sm font-bold text-zinc-800">
                {displayName}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-medium pt-0.5">
                {influencer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#ff5500]" />
                    <span>{influencer.city}, {influencer.state || 'USA'}</span>
                  </span>
                )}
                <a
                  href={influencer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#ff5500] hover:underline font-bold"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>instagram.com/{influencer.instagram_handle.replace(/^@/, '')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <button
              type="button"
              onClick={() => setShowMetaViewer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff5500] text-xs font-bold transition-all shadow-xs"
            >
              <Instagram className="h-4 w-4" />
              <span>Launch In-App IG Profile</span>
            </button>
          </div>
        </div>

        {/* Live Instagram Follower & Activity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Followers</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
              {displayFollowers}
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Posts</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
              {liveProfile?.postCount || '—'}
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Following</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
              {liveProfile?.followingCount || '—'}
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Touches</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 mt-1">
              {outreachHistory.length}
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Accounts Contacted</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 mt-1">
              {contactedAccountIds.size}
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Repeat Touches</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#ff5500] mt-1">
              {repeats.length}
            </div>
          </div>
        </div>

        {/* Bio Box */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-2">
          <div className="text-[11px] font-bold text-zinc-500 uppercase font-mono flex items-center justify-between">
            <span>Instagram Bio & Dossier Details</span>
            {liveProfile?.isLive && <span className="text-emerald-600 font-bold text-[10px]">Verified from Meta</span>}
          </div>
          <p className="text-xs sm:text-sm text-zinc-800 whitespace-pre-line leading-relaxed font-sans">
            {displayBio}
          </p>
        </div>

        {/* Real Recent Posts Gallery */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ff5500]" />
              <span>Recent Feed Photos ({liveProfile?.posts ? liveProfile.posts.length : 'Live Meta Gallery'})</span>
            </h3>
            <button
              onClick={() => setShowMetaViewer(true)}
              className="text-xs text-[#ff5500] hover:text-[#e04a00] font-bold hover:underline"
            >
              Open Full In-App Viewer ↗
            </button>
          </div>

          {liveProfile?.posts && liveProfile.posts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
              {liveProfile.posts.slice(0, 6).map((post, idx) => (
                <a
                  key={post.id || idx}
                  href={post.url || influencer.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 block shadow-2xs cursor-pointer"
                >
                  <img
                    src={imageErrorMap[`detail-post-${idx}`] || post.imageUrl}
                    onError={() => handleImageError(`detail-post-${idx}`, post.imageUrl)}
                    referrerPolicy="no-referrer"
                    alt="Instagram Post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white font-bold text-xs p-1 text-center font-mono">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <Heart className="h-3.5 w-3.5 fill-white" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-300 underline">View ↗</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-2">
              <Instagram className="h-8 w-8 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-600 font-medium">
                Photo posts can be previewed directly via Meta in-app profile.
              </p>
              <button
                onClick={() => setShowMetaViewer(true)}
                className="px-4 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Launch In-App Meta Feed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chronological Outreach Timeline */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-5 shadow-tox-lg">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center justify-between border-b border-zinc-100 pb-4">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#ff5500]" />
            <span>Chronological Outreach Timeline</span>
          </span>
          <Badge variant="primary" size="xs">
            {outreachHistory.length} Total Touchpoints
          </Badge>
        </h2>

        {outreachHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 rounded-2xl border border-zinc-200 bg-zinc-50">
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

