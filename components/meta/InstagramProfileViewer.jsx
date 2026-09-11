'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Instagram,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Send,
  RotateCcw,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Globe,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { db } from '@/lib/db/provider.js';
import { normalizeHandle } from '@/lib/normalization.js';
import { formatOutreachDate } from '@/lib/utils.js';

export function InstagramProfileViewer({ handle, onClose, onLogOutreachDirect }) {
  const { addToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [internalData, setInternalData] = useState({ exists: false, influencer: null, outreachHistory: [] });
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('POSTS'); // POSTS, TOX_HISTORY
  const [imageErrorMap, setImageErrorMap] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [reviewTag, setReviewTag] = useState('');

  useEffect(() => {
    if (handle) {
      loadLiveProfile(handle);
    }
  }, [handle]);

  const openPocketBrowser = () => {
    if (!profileData) return;
    const url = profileData.instagramUrl || `https://www.instagram.com/${handle}/`;
    const width = 480;
    const height = 840;
    const left = typeof window !== 'undefined' && window.screen?.width ? Math.max(20, Math.floor((window.screen.width - width) / 2)) : 100;
    const top = 50;
    window.open(
      url,
      'ToxPocketBrowser',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,toolbar=no`
    );
    addToast({
      title: 'Pocket Browser Launched',
      message: `Opened ${profileData.formattedHandle} in dedicated Instagram pocket companion window.`,
      type: 'info',
    });
  };

  const loadLiveProfile = async (rawHandle) => {
    setLoading(true);
    const norm = normalizeHandle(rawHandle);

    try {
      // 1. Fetch real live Instagram profile data from our live Meta API endpoint
      const res = await fetch(`/api/meta/profile?handle=${encodeURIComponent(norm.normalized)}`);
      const data = await res.json();

      const allAccounts = await db.getAccounts();
      setAccounts(allAccounts);

      if (data && data.profile) {
        setProfileData(data.profile);
        setInternalData(data.internal || { exists: false, influencer: null, outreachHistory: [] });
      } else {
        throw new Error(data?.error || 'Failed to fetch live profile');
      }
    } catch (err) {
      console.warn('Live Instagram fetch error, providing local fallback:', err);
      // Fallback
      const existing = await db.getInfluencerByHandle(norm.normalized);
      const outreach = existing ? await db.getOutreachRecords({ influencer_id: existing.id }) : [];
      setProfileData({
        isLive: false,
        username: norm.normalized,
        formattedHandle: norm.formatted,
        displayName: existing?.display_name || norm.normalized,
        bio: existing?.bio || `Instagram creator @${norm.normalized}`,
        followerCount: existing?.follower_count ? existing.follower_count.toLocaleString() : '10K+',
        followingCount: '—',
        postCount: '—',
        avatarUrl: null,
        verified: !!existing?.verified,
        instagramUrl: norm.url,
        posts: null,
        source: 'Database Fallback',
      });
      setInternalData({
        exists: !!existing,
        influencer: existing,
        outreachHistory: outreach,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHandle = () => {
    if (!profileData) return;
    navigator.clipboard.writeText(profileData.formattedHandle);
    addToast({
      title: 'Handle Copied',
      message: `${profileData.formattedHandle} copied to clipboard.`,
      type: 'success',
    });
  };

  const handleAddToToxAndLog = () => {
    if (onLogOutreachDirect) {
      onLogOutreachDirect(profileData.formattedHandle);
    } else {
      router.push(`/outreach`);
    }
    onClose();
  };

  const handleImageError = (id, originalUrl) => {
    if (!imageErrorMap[id]) {
      setImageErrorMap((prev) => ({
        ...prev,
        [id]: `/api/meta/proxy-image?url=${encodeURIComponent(originalUrl)}`,
      }));
    }
  };

  if (!handle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Main Instagram In-App Window */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Instagram In-App Navigation Bar */}
        <div className="px-6 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-white select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Instagram className="h-4 w-4" />
            </div>
            <span className="font-black text-sm text-zinc-950 tracking-tight font-sans">
              Instagram Live In-App Profile
            </span>
            {profileData?.isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Meta Data
              </span>
            ) : (
              <Badge variant="warning" size="xs">
                Offline Mode
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openPocketBrowser}
              className="px-2.5 py-1 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff5500] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Launch dedicated Pocket Browser mobile window to browse all posts and videos freely"
            >
              <Sparkles className="h-3 w-3 text-[#ff5500]" />
              <span className="hidden sm:inline">Pocket Browser</span>
              <span className="sm:hidden">Pocket</span>
            </button>
            <button
              onClick={handleCopyHandle}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="h-3 w-3 text-[#ff5500]" />
              <span>Copy</span>
            </button>
            <a
              href={profileData?.instagramUrl || `https://www.instagram.com/${handle}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Open Official Instagram Page in New Tab"
            >
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Open on Instagram</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-zinc-700 font-bold">Connecting to Instagram Meta servers for live data...</p>
            <p className="text-[11px] text-zinc-400 font-mono">Resolving followers, bio, verified status & recent posts</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Profile Header */}
            <div className="p-6 md:p-8 space-y-6 bg-white border-b border-zinc-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Real Avatar with Instagram Story Ring */}
                <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                  <div className="p-0.5 bg-white rounded-full">
                    {profileData.avatarUrl ? (
                      <img
                        src={imageErrorMap['avatar'] || profileData.avatarUrl}
                        onError={() => handleImageError('avatar', profileData.avatarUrl)}
                        referrerPolicy="no-referrer"
                        alt={profileData.username}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-inner"
                      />
                    ) : (
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-orange-400 to-[#ff5500] text-white flex items-center justify-center font-black text-3xl font-mono">
                        @
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Stats & Identity */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-black font-mono text-zinc-950">
                        {profileData.formattedHandle}
                      </h2>
                      {profileData.verified && (
                        <CheckCircle2 className="h-4 w-4 text-sky-500 fill-sky-500" title="Verified Creator" />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleAddToToxAndLog}
                        className="px-5 py-2 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Log Outreach</span>
                      </button>
                    </div>
                  </div>

                  {/* Real Live Followers Counts */}
                  <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-zinc-800">
                    <div>
                      <span className="font-black text-zinc-950 font-mono text-sm">
                        {profileData.postCount}
                      </span>{' '}
                      <span className="text-zinc-500 font-medium">posts</span>
                    </div>
                    <div>
                      <span className="font-black text-zinc-950 font-mono text-sm">
                        {profileData.followerCount}
                      </span>{' '}
                      <span className="text-zinc-500 font-medium">followers</span>
                    </div>
                    <div>
                      <span className="font-black text-zinc-950 font-mono text-sm">
                        {profileData.followingCount}
                      </span>{' '}
                      <span className="text-zinc-500 font-medium">following</span>
                    </div>
                  </div>

                  {/* Real Display Name & Bio */}
                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-sm text-zinc-950">
                      {profileData.displayName}
                    </div>
                    <p className="text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
                      {profileData.bio}
                    </p>
                    <a
                      href={profileData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#ff5500] hover:underline font-bold pt-0.5"
                    >
                      <Globe className="h-3 w-3" />
                      <span>instagram.com/{profileData.username}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Integrated Tox Technique Intelligence Box */}
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/90 via-white to-orange-50/50 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-[#ff5500] text-white flex items-center justify-center text-xs font-black shadow-xs">
                      T
                    </div>
                    <span className="text-xs font-black text-zinc-950 font-mono">
                      The Tox Technique Dossier
                    </span>
                  </div>

                  {internalData.exists ? (
                    <Badge variant="success" size="xs">
                      ✓ In Tox Database
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="xs">
                      New Creator — Not in DB
                    </Badge>
                  )}
                </div>

                {internalData.exists ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Touches</span>
                        <span className="font-black font-mono text-zinc-950 text-sm">
                          {internalData.outreachHistory.length}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Accounts</span>
                        <span className="font-black font-mono text-blue-600 text-sm">
                          {new Set(internalData.outreachHistory.map((o) => o.account_id)).size}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Repeats</span>
                        <span className="font-black font-mono text-[#ff5500] text-sm">
                          {internalData.outreachHistory.filter((o) => o.is_repeat_same_account).length}
                        </span>
                      </div>
                    </div>

                    {internalData.outreachHistory.length > 0 && (
                      <div className="text-xs text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200 space-y-1.5 shadow-2xs">
                        <div className="font-bold text-zinc-900 text-[11px]">Past Outreach Timeline:</div>
                        {internalData.outreachHistory.slice(0, 3).map((o) => {
                          const acc = accounts.find((a) => a.id === o.account_id);
                          return (
                            <div key={o.id} className="flex items-center justify-between text-[11px]">
                              <span>Account: <strong className="text-zinc-900">{acc?.account_name || 'Marketing Account'}</strong></span>
                              <span className="font-mono text-zinc-500 font-medium">
                                {o.outreach_date ? formatOutreachDate(o.outreach_date) : 'Historical'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-zinc-600 font-medium">
                      This creator has not been contacted yet by any of your marketing accounts.
                    </p>
                    <button
                      onClick={handleAddToToxAndLog}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                    >
                      + Add & Log
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Posts Grid Header Tabs */}
            <div className="flex border-b border-zinc-200 text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider justify-center gap-8 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('POSTS')}
                className={`py-3.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'POSTS'
                    ? 'border-[#ff5500] text-[#ff5500]'
                    : 'border-transparent hover:text-zinc-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Recent Posts ({profileData.posts ? profileData.posts.length : 'Live Feed'})</span>
              </button>
            </div>

            {/* 3-Column Instagram Post Grid */}
            <div className="p-6">
              {profileData.posts && profileData.posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {profileData.posts.map((post, idx) => (
                    <div
                      key={post.id || idx}
                      onClick={() => setSelectedPost(post)}
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-100 cursor-pointer border border-zinc-200 block shadow-xs"
                    >
                      <img
                        src={imageErrorMap[post.id] || post.imageUrl}
                        onError={() => handleImageError(post.id, post.imageUrl)}
                        referrerPolicy="no-referrer"
                        alt="Instagram post"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-xs font-mono p-2 text-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 fill-white" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 fill-white" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-orange-400 font-bold">Review Post & Video ⚡</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Instagram className="h-10 w-10 text-zinc-400 mx-auto" />
                  <div className="text-sm font-bold text-zinc-800">
                    {profileData.displayName}'s Profile ({profileData.formattedHandle})
                  </div>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Open the live Instagram page or launch the Pocket Browser to view all {profileData.postCount} photos, videos, and stories.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={openPocketBrowser}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold transition-all shadow-tox-orange"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Launch Pocket Browser</span>
                    </button>
                    <a
                      href={profileData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Official Feed</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Post & Video Reviewer Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh]">
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-xs font-black">
                  <Instagram className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-950 font-mono">
                    {profileData.formattedHandle} Post Review
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Content View */}
            <div className="relative aspect-square max-h-[50vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={imageErrorMap[selectedPost.id] || selectedPost.imageUrl}
                onError={() => handleImageError(selectedPost.id, selectedPost.imageUrl)}
                referrerPolicy="no-referrer"
                alt="Post inspection"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xs text-white text-xs font-mono font-bold">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="h-3.5 w-3.5 fill-rose-400" />
                    {selectedPost.likes} Likes
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {selectedPost.comments} Comments
                  </span>
                </div>
                <span className="text-[10px] text-zinc-300">Live Post Media</span>
              </div>
            </div>

            {/* Evaluation & Action Bar */}
            <div className="p-5 space-y-4 bg-white overflow-y-auto">
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold text-zinc-500 font-mono flex items-center justify-between">
                  <span>Outreach Fit Assessment</span>
                  {reviewTag && (
                    <Badge variant="orange" size="xs">
                      {reviewTag}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setReviewTag('Top Aesthetic Fit');
                      addToast({ title: 'Tag Saved', message: 'Marked as Top Aesthetic Fit for Tox Body campaigns', type: 'success' });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      reviewTag === 'Top Aesthetic Fit'
                        ? 'bg-orange-50 border-[#ff5500] text-[#ff5500]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    🔥 Top Aesthetic Fit
                  </button>
                  <button
                    onClick={() => {
                      setReviewTag('High Engagement');
                      addToast({ title: 'Tag Saved', message: 'Marked as High Engagement content', type: 'success' });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      reviewTag === 'High Engagement'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    📈 High Engagement
                  </button>
                  <button
                    onClick={() => {
                      setReviewTag('Keep On Radar');
                      addToast({ title: 'Tag Saved', message: 'Marked to Keep on Radar', type: 'info' });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      reviewTag === 'Keep On Radar'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    👀 Keep on Radar
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => {
                    handleAddToToxAndLog();
                    setSelectedPost(null);
                  }}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Log Outreach for This Creator</span>
                </button>
                <button
                  onClick={() => {
                    openPocketBrowser();
                    setSelectedPost(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff5500] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  title="Open in Pocket Browser window to watch full video"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pocket Window</span>
                </button>
                <a
                  href={selectedPost.url || profileData.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
