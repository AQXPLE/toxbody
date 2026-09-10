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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { db } from '@/lib/db/provider.js';
import { normalizeHandle } from '@/lib/normalization.js';
import { formatOutreachDate } from '@/lib/utils.js';

// High quality curated lifestyle & wellness photos for simulated IG feed
const FEED_PHOTOS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
];

export function InstagramProfileViewer({ handle, onClose, onLogOutreachDirect }) {
  const { addToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [internalInfluencer, setInternalInfluencer] = useState(null);
  const [internalOutreach, setInternalOutreach] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('POSTS'); // POSTS, TOX_HISTORY

  useEffect(() => {
    if (handle) {
      loadProfile(handle);
    }
  }, [handle]);

  const loadProfile = async (rawHandle) => {
    setLoading(true);
    const norm = normalizeHandle(rawHandle);

    // 1. Check if influencer exists in internal Tox database
    const existing = await db.getInfluencerByHandle(norm.normalized);
    setInternalInfluencer(existing);

    const allAccounts = await db.getAccounts();
    setAccounts(allAccounts);

    let outreach = [];
    if (existing) {
      outreach = await db.getOutreachRecords({ influencer_id: existing.id });
      setInternalOutreach(outreach);
    } else {
      setInternalOutreach([]);
    }

    // 2. Build or resolve Instagram Meta Profile Data
    // Generate deterministic rich profile numbers based on handle hash
    let hash = 0;
    for (let i = 0; i < norm.normalized.length; i++) {
      hash = (hash << 5) - hash + norm.normalized.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const followerCount = existing?.follower_count || 12000 + (absHash % 480000);
    const followingCount = 400 + (absHash % 1200);
    const postCount = 80 + (absHash % 600);

    const formattedName = norm.normalized
      .split(/[._]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const sampleBio = existing?.bio || `Wellness & lymphatic drainage enthusiast ✨\n📍 ${existing?.city || 'Dallas / Austin, TX'}\n💌 Collabs: ${norm.normalized}@influencerpr.com\nlinktr.ee/${norm.normalized}`;

    // Generate 9 simulated posts
    const posts = FEED_PHOTOS.map((img, idx) => ({
      id: `post-${idx}`,
      imageUrl: img,
      likes: Math.floor(followerCount * 0.04 + (idx * 37) % 800),
      comments: Math.floor(followerCount * 0.003 + (idx * 9) % 90),
      caption: idx === 0
        ? `Post-lymphatic drainage session feeling lighter than ever! Thank you for the treatment 🤍✨ #wellness #healthylifestyle`
        : `Self care Sunday routine 🫧 Hydration + movement + body care`,
      date: `${idx + 1}d ago`,
    }));

    setProfileData({
      username: norm.normalized,
      formattedHandle: norm.formatted,
      displayName: existing?.display_name || formattedName,
      avatarUrl: FEED_PHOTOS[absHash % FEED_PHOTOS.length],
      followerCount,
      followingCount,
      postCount,
      bio: sampleBio,
      verified: existing ? existing.verified : absHash % 3 === 0,
      posts,
      url: norm.url,
      isInDatabase: !!existing,
    });

    setLoading(false);
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

  if (!handle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Main Instagram In-App Window */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Instagram In-App Navigation Bar */}
        <div className="px-6 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-white select-none">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Instagram className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-zinc-900 tracking-tight font-sans">
              Instagram Meta Viewer
            </span>
            <Badge variant="primary" size="xs">
              In-App Browser
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHandle}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
            <a
              href={profileData?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
              title="Open Official Instagram"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-mono">Fetching Instagram profile & Tox intelligence...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Profile Header */}
            <div className="p-6 md:p-8 space-y-6 bg-white border-b border-zinc-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar with Story Ring */}
                <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                  <div className="p-0.5 bg-white rounded-full">
                    <img
                      src={profileData.avatarUrl}
                      alt={profileData.username}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-inner"
                    />
                  </div>
                </div>

                {/* Profile Stats & Identity */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-bold font-mono text-zinc-900">
                        {profileData.formattedHandle}
                      </h2>
                      {profileData.verified && (
                        <CheckCircle2 className="h-4 w-4 text-sky-500 fill-sky-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleAddToToxAndLog}
                        className="px-4 py-1.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Log Outreach</span>
                      </button>
                    </div>
                  </div>

                  {/* Followers Counts */}
                  <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-zinc-800">
                    <div>
                      <span className="font-bold text-zinc-900 font-mono">
                        {profileData.postCount.toLocaleString()}
                      </span>{' '}
                      <span className="text-zinc-500">posts</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 font-mono">
                        {profileData.followerCount.toLocaleString()}
                      </span>{' '}
                      <span className="text-zinc-500">followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 font-mono">
                        {profileData.followingCount.toLocaleString()}
                      </span>{' '}
                      <span className="text-zinc-500">following</span>
                    </div>
                  </div>

                  {/* Display Name & Bio */}
                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-xs text-zinc-900">
                      {profileData.displayName}
                    </div>
                    <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed">
                      {profileData.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrated Tox Technique Intelligence Box */}
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/80 via-white to-orange-50/40 p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-[#ff5500] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      T
                    </div>
                    <span className="text-xs font-bold text-zinc-900 font-mono">
                      Tox Technique Internal Intelligence
                    </span>
                  </div>

                  {profileData.isInDatabase ? (
                    <Badge variant="success" size="xs">
                      ✓ In Tox Database
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="xs">
                      Not In Database Yet
                    </Badge>
                  )}
                </div>

                {profileData.isInDatabase ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white border border-zinc-200">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Outreach</span>
                        <span className="font-bold font-mono text-zinc-900">{internalOutreach.length}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-zinc-200">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Accounts</span>
                        <span className="font-bold font-mono text-blue-700">
                          {new Set(internalOutreach.map((o) => o.account_id)).size}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-zinc-200">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Repeats</span>
                        <span className="font-bold font-mono text-[#ff5500]">
                          {internalOutreach.filter((o) => o.is_repeat_same_account).length}
                        </span>
                      </div>
                    </div>

                    {internalOutreach.length > 0 && (
                      <div className="text-[11px] text-zinc-600 bg-white p-2 rounded-lg border border-zinc-200 space-y-1">
                        <div className="font-semibold text-zinc-800">Prior Outreach Touchpoints:</div>
                        {internalOutreach.slice(0, 3).map((o) => {
                          const acc = accounts.find((a) => a.id === o.account_id);
                          return (
                            <div key={o.id} className="flex items-center justify-between text-[10px]">
                              <span>Account: <strong className="text-zinc-900">{acc?.account_name || 'Account'}</strong></span>
                              <span className="font-mono text-zinc-500">{o.outreach_date ? formatOutreachDate(o.outreach_date) : 'Historical'}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-zinc-600">
                      This creator hasn't been logged in your Tox outreach database yet.
                    </p>
                    <button
                      onClick={handleAddToToxAndLog}
                      className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
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
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'POSTS'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent hover:text-zinc-700'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Recent Posts ({profileData.posts.length})</span>
              </button>
            </div>

            {/* 3-Column Instagram Post Grid */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {profileData.posts.map((post) => (
                  <div
                    key={post.id}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-100 cursor-pointer border border-zinc-200"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Instagram post"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 fill-white" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
