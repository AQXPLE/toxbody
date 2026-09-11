'use client';

import React, { useState, useEffect } from 'react';
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
  Globe,
  Layers,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatOutreachDate } from '@/lib/utils.js';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';

export function InfluencerDrawer({ influencer, outreachHistory, accounts, employees, onClose }) {
  const [showMetaViewer, setShowMetaViewer] = useState(false);
  const [liveProfile, setLiveProfile] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});

  useEffect(() => {
    if (influencer?.instagram_handle) {
      setLiveProfile(null);
      setLoadingLive(true);
      fetch(`/api/meta/profile?handle=${encodeURIComponent(influencer.instagram_handle.replace(/^@/, ''))}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.profile) {
            setLiveProfile(data.profile);
          }
        })
        .catch((err) => console.error('Error fetching drawer live profile:', err))
        .finally(() => setLoadingLive(false));
    } else {
      setLiveProfile(null);
    }
  }, [influencer?.id, influencer?.instagram_handle]);

  const handleImageError = (id, originalUrl) => {
    if (!imageErrorMap[id]) {
      setImageErrorMap((prev) => ({
        ...prev,
        [id]: `/api/meta/proxy-image?url=${encodeURIComponent(originalUrl)}`,
      }));
    }
  };

  if (!influencer) return null;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Calculate distinct accounts contacted
  const contactedAccountIds = new Set(outreachHistory.map((o) => o.account_id));
  const repeatOutreaches = outreachHistory.filter((o) => o.is_repeat_same_account);

  const displayFollowers = liveProfile?.followerCount || (influencer.follower_count ? influencer.follower_count.toLocaleString() : '12,400+');
  const displayBio = liveProfile?.bio || influencer.bio || `Creator ${influencer.instagram_handle} • ${influencer.niche || 'Wellness & Lifestyle'}`;
  const displayName = liveProfile?.displayName || influencer.display_name || influencer.instagram_handle;
  const isVerified = liveProfile ? liveProfile.verified : !!influencer.verified;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

        {/* Slide-over Pane */}
        <div className="relative w-full max-w-2xl bg-obsidian-950 border-l border-white/10 shadow-2xl shadow-black h-full flex flex-col z-10 animate-in slide-in-from-right-10 duration-200 text-zinc-200">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-start justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                <div className="p-0.5 bg-obsidian-950 rounded-full">
                  {liveProfile?.avatarUrl ? (
                    <img
                      src={imageErrorMap['drawer-avatar'] || liveProfile.avatarUrl}
                      onError={() => handleImageError('drawer-avatar', liveProfile.avatarUrl)}
                      referrerPolicy="no-referrer"
                      alt={influencer.instagram_handle}
                      className="h-14 w-14 rounded-full object-cover shadow-inner"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-tox-orange to-orange-400 text-black flex items-center justify-center font-bold text-xl shadow-md">
                      @
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                    {influencer.instagram_handle}
                  </h2>
                  {isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-sky-400 fill-sky-400" title="Verified on Meta" />
                  )}
                  {liveProfile?.isLive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live Meta
                    </span>
                  )}
                  {loadingLive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tox-orange/10 border border-tox-orange/20 text-tox-orange text-[10px] font-semibold animate-pulse">
                      Syncing...
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 font-medium">
                  {displayName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/influencers/${influencer.id}`}
                className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
                title="Open full influencer dossier"
              >
                <span>Dossier</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </Link>
              <a
                href={influencer.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
                title="Open live on Instagram"
              >
                <Instagram className="h-3.5 w-3.5 text-tox-orange" />
                <span>Instagram</span>
              </a>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="p-2 rounded-xl text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Real Instagram Profile Dossier */}
            <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/60 p-5 space-y-4 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-tox-orange" />
                  <span>Live Instagram Profile</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowMetaViewer(true)}
                  className="text-xs text-tox-orange hover:text-tox-orange-hover font-semibold transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Expand Full Meta Viewer ↗
                </button>
              </div>

              {/* Follower Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] shadow-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Followers</span>
                  <span className="font-bold font-mono text-white text-base tabular-nums">{displayFollowers}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] shadow-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Posts</span>
                  <span className="font-bold font-mono text-white text-base tabular-nums">{liveProfile?.postCount || '—'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] shadow-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Following</span>
                  <span className="font-bold font-mono text-white text-base tabular-nums">{liveProfile?.followingCount || '—'}</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] space-y-1.5 shadow-xs">
                <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase">Instagram Bio</div>
                <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                  {displayBio}
                </p>
                {influencer.city && (
                  <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    <span>Location: <strong className="text-zinc-200">{influencer.city}, {influencer.state || 'USA'}</strong></span>
                  </div>
                )}
              </div>

              {/* Live Post Thumbnails if available */}
              {liveProfile?.posts && liveProfile.posts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase">Recent Feed Photos</div>
                  <div className="grid grid-cols-3 gap-2">
                    {liveProfile.posts.slice(0, 6).map((post, idx) => (
                      <a
                        key={post.id || idx}
                        href={post.url || influencer.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group aspect-square rounded-xl overflow-hidden bg-obsidian-900 border border-white/10 block shadow-xs"
                      >
                        <img
                          src={imageErrorMap[`drawer-post-${idx}`] || post.imageUrl}
                          onError={() => handleImageError(`drawer-post-${idx}`, post.imageUrl)}
                          referrerPolicy="no-referrer"
                          alt="Post"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
                          View Post ↗
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Total Outreach
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {outreachHistory.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Accounts Reached
                </div>
                <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                  {contactedAccountIds.size}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Repeat Outreach
                </div>
                <div className="text-2xl font-bold font-mono text-tox-orange mt-1 tabular-nums">
                  {repeatOutreaches.length}
                </div>
              </div>
            </div>

            {/* Chronological Outreach Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center justify-between">
                <span>Chronological Outreach Touchpoints</span>
                <Badge variant="primary" size="xs">
                  {outreachHistory.length} Events
                </Badge>
              </h4>

              {outreachHistory.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  No outreach has been logged for this influencer yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {outreachHistory.map((event) => {
                    const acc = accountMap.get(event.account_id);
                    const emp = employeeMap.get(event.employee_id);

                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-2 hover:border-white/[0.15] transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
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
                          <div>
                            <span>Staff: </span>
                            <strong className="text-zinc-200">{emp?.full_name || 'Historical / Unknown'}</strong>
                          </div>
                          <div className="font-mono text-zinc-400 tabular-nums">
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
                          <div className="text-xs text-zinc-300 bg-obsidian-950/80 p-3 rounded-xl border border-white/[0.06] mt-1.5 font-sans">
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

      {/* Full In-App Meta / Instagram Profile Viewer Modal */}
      {showMetaViewer && (
        <InstagramProfileViewer
          handle={influencer.instagram_handle}
          onClose={() => setShowMetaViewer(false)}
        />
      )}
    </>
  );
}
