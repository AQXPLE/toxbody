'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Instagram,
  Sparkles,
  ExternalLink,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';
import { db } from '@/lib/db/provider.js';

export default function MetaSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeViewerHandle, setActiveViewerHandle] = useState(null);
  const [internalInfluencers, setInternalInfluencers] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    '@example',
    '@notboredindc',
    '@azfoodie',
    '@tastesoftheunion',
    '@willworkforfashion',
    '@kendalljenner',
  ]);

  useEffect(() => {
    db.getInfluencers().then(setInternalInfluencers);
    if (initialQuery) {
      setActiveViewerHandle(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const clean = searchTerm.trim();
    setActiveViewerHandle(clean);

    if (!recentSearches.includes(clean)) {
      setRecentSearches([clean, ...recentSearches.slice(0, 5)]);
    }
  };

  const openHandleInViewer = (handle) => {
    setSearchTerm(handle);
    setActiveViewerHandle(handle);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-xs font-bold shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Meta / Instagram In-App Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
          Explore Any Instagram Creator
        </h1>
        <p className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed">
          Search any Instagram handle—whether registered in your Tox database or discovered in the wild. View their authentic in-app profile, posts, follower metrics, and cross-account touchpoint history.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="max-w-2xl mx-auto rounded-2xl border-2 border-zinc-200 bg-white p-2 shadow-tox-lg focus-within:border-[#ff5500] focus-within:ring-4 focus-within:ring-orange-500/10 transition-all"
      >
        <div className="flex items-center gap-3 px-3">
          <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#ff5500] shrink-0">
            <Instagram className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search any Instagram handle (e.g. @jessica, @azfoodie)..."
            className="w-full text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all shrink-0 flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Suggested Quick Test Handles */}
      <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-500 font-medium text-[11px]">Popular searches:</span>
        {recentSearches.map((h) => (
          <button
            key={h}
            onClick={() => openHandleInViewer(h)}
            className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 text-zinc-800 font-mono text-xs transition-colors shadow-2xs"
          >
            {h.startsWith('@') ? h : `@${h}`}
          </button>
        ))}
      </div>

      {/* Internal Database Quick Matching Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-tox space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Creators in Your Internal Outreach Database
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click any creator below to preview their Meta Instagram profile & internal outreach dossier.
            </p>
          </div>
          <Badge variant="primary" size="xs">
            {internalInfluencers.length} Total Registered
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {internalInfluencers.slice(0, 9).map((inf) => (
            <div
              key={inf.id}
              onClick={() => openHandleInViewer(inf.instagram_handle)}
              className="p-3.5 rounded-xl border border-zinc-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer group bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ff5500] font-mono font-bold text-xs">
                  @
                </div>
                <div>
                  <div className="text-xs font-bold font-mono text-zinc-900 group-hover:text-[#ff5500] transition-colors">
                    {inf.instagram_handle}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {inf.city ? `${inf.city}, ${inf.state || ''}` : 'Location unassigned'}
                  </div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#ff5500] group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Interactive In-App Instagram Viewer Modal */}
      {activeViewerHandle && (
        <InstagramProfileViewer
          handle={activeViewerHandle}
          onClose={() => setActiveViewerHandle(null)}
          onLogOutreachDirect={(h) => {
            router.push(`/outreach`);
          }}
        />
      )}
    </div>
  );
}
