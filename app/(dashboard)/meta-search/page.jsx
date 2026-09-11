'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  X,
  Compass,
  Laptop,
  Flame,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { db } from '@/lib/db/provider.js';

export default function MetaSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('handle') || '';
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeViewerHandle, setActiveViewerHandle] = useState(null);
  const [internalInfluencers, setInternalInfluencers] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    '@azfoodie',
    '@kendalljenner',
    '@hudabeauty',
    '@drgulnurbayramli',
    '@notboredindc',
    '@haileybieber',
  ]);

  // Instagram-style Autocomplete state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [imageErrorMap, setImageErrorMap] = useState({});

  // Pocket Browser companion state
  const [pocketHandleInput, setPocketHandleInput] = useState('');

  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    db.getInfluencers().then(setInternalInfluencers);
    if (initialQuery) {
      setActiveViewerHandle(initialQuery);
    }
  }, [initialQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Instagram-style autocomplete search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const clean = searchTerm.replace(/^@/, '').trim();
        const res = await fetch(`/api/meta/search?q=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Error fetching search autocomplete:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchTerm]);

  const handleSelectCreator = (handle) => {
    const clean = handle.replace(/^@/, '');
    setSearchTerm(`@${clean}`);
    setActiveViewerHandle(clean);
    setDropdownOpen(false);

    if (!recentSearches.includes(`@${clean}`)) {
      setRecentSearches([`@${clean}`, ...recentSearches.slice(0, 5)]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // If an item in dropdown is focused via arrow keys, select it
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleSelectCreator(searchResults[selectedIndex].username);
      return;
    }

    handleSelectCreator(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (!dropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleImageError = (id, originalUrl) => {
    if (!imageErrorMap[id]) {
      setImageErrorMap((prev) => ({
        ...prev,
        [id]: `/api/meta/proxy-image?url=${encodeURIComponent(originalUrl)}`,
      }));
    }
  };

  // Launch Pocket Browser window (unrestricted mobile viewport)
  const launchPocketBrowser = (rawHandle) => {
    const target = (rawHandle || searchTerm || 'azfoodie').replace(/^@/, '').trim();
    if (!target) return;

    const url = `https://www.instagram.com/${target}/`;
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
      message: `Opened @${target} in dedicated pocket companion window.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-Time Meta / Instagram Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Live Instagram Search & Profile Explorer
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Type any creator name or handle to see live profile suggestions with profile pictures, follower counts, verified checkmarks, and in-app profile dossiers.
        </p>
      </div>

      {/* Instagram-style Autocomplete Search Box Container */}
      <div ref={searchContainerRef} className="relative max-w-2xl mx-auto z-30">
        <form
          onSubmit={handleFormSubmit}
          className="relative rounded-3xl border border-white/15 bg-obsidian-950/90 backdrop-blur-xl p-2 shadow-2xl focus-within:border-tox-orange focus-within:ring-2 focus-within:ring-tox-orange/20 transition-all"
        >
          <div className="flex items-center gap-3 px-3">
            <div className="h-10 w-10 rounded-2xl bg-tox-orange/10 border border-tox-orange/20 flex items-center justify-center text-tox-orange shrink-0">
              <Instagram className="h-5 w-5" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim() && searchResults.length > 0) {
                  setDropdownOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search Instagram creators (e.g. azfoodie, kendall, huda, health)..."
              className="w-full text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-none bg-transparent"
              autoComplete="off"
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  setDropdownOpen(false);
                }}
                aria-label="Clear search"
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Spinner or Submit Button */}
            {isSearching ? (
              <div className="px-3 py-2">
                <div className="h-4 w-4 rounded-full border-2 border-tox-orange border-t-transparent animate-spin" />
              </div>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            )}
          </div>
        </form>

        {/* Live Instagram Autocomplete Dropdown Popover */}
        {dropdownOpen && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-white/15 bg-obsidian-950/95 shadow-2xl shadow-black backdrop-blur-2xl overflow-hidden divide-y divide-white/[0.06] animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto z-50 text-zinc-200">
            <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400 font-mono tracking-wider">
              <span>Matching Instagram Profiles</span>
              <span className="tabular-nums">{searchResults.length} Found</span>
            </div>

            {searchResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.id || item.username}
                  onClick={() => handleSelectCreator(item.username)}
                  className={`p-3.5 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-tox-orange/10 border-l-4 border-l-tox-orange' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Real Profile Avatar with Instagram Story Gradient Ring */}
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                      <div className="p-0.5 bg-obsidian-950 rounded-full">
                        {item.avatarUrl ? (
                          <img
                            src={imageErrorMap[item.id] || item.avatarUrl}
                            onError={() => handleImageError(item.id, item.avatarUrl)}
                            referrerPolicy="no-referrer"
                            alt={item.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-tox-orange to-orange-400 text-black flex items-center justify-center font-bold text-sm font-mono">
                            {item.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Creator Identity & Meta Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-sm text-white truncate">
                          {item.formattedHandle}
                        </span>
                        {item.verified && (
                          <CheckCircle2 className="h-4 w-4 text-sky-400 fill-sky-400 shrink-0" title="Verified Creator" />
                        )}
                        {item.isLivePrompt && (
                          <span className="px-1.5 py-0.5 rounded-full bg-tox-orange/10 text-tox-orange text-[9px] font-semibold border border-tox-orange/20">
                            Live Query
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-400 truncate font-normal">
                        {item.displayName}
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-0.5 font-sans">
                        <span className="font-medium text-zinc-200">{item.followerCount} followers</span>
                        {item.niche && <span>• {item.niche}</span>}
                        {item.location && <span>• {item.location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-2 pl-3">
                    {item.inDatabase ? (
                      <Badge variant="success" size="xs">
                        ✓ In Tox DB
                      </Badge>
                    ) : (
                      <Badge variant="default" size="xs">
                        Meta Creator
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-tox-orange transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggested Quick Test Handles */}
      <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-400 font-mono text-[11px]">Popular Live Profiles:</span>
        {recentSearches.map((h) => (
          <button
            key={h}
            onClick={() => handleSelectCreator(h)}
            className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] hover:border-tox-orange/40 hover:bg-tox-orange/10 text-zinc-300 hover:text-white font-mono text-xs font-medium transition-all shadow-xs flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
          >
            <span>{h}</span>
          </button>
        ))}
      </div>

      {/* Pocket Browser Companion Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-[10px] font-semibold">
              <Laptop className="h-3 w-3" />
              <span>Full Unrestricted Browsing</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
              <span>Tox Pocket Browser Companion</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              Want to review all historical posts, watch full videos, and view reels without login walls or iframe limits? Launch our 1-click Pocket Browser companion window alongside Tox Body.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => launchPocketBrowser(pocketHandleInput || searchTerm || 'azfoodie')}
              className="px-4 py-2 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Pocket Window ↗</span>
            </button>
          </div>
        </div>

        {/* Quick Launch Handle Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={pocketHandleInput}
              onChange={(e) => setPocketHandleInput(e.target.value)}
              placeholder="Enter creator handle for Pocket Browser (e.g. @azfoodie)..."
              className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-white/10 bg-obsidian-900/90 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-tox-orange"
            />
          </div>
          <button
            onClick={() => launchPocketBrowser(pocketHandleInput || 'azfoodie')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
          >
            Open in Pocket Browser
          </button>
        </div>
      </div>

      {/* Internal Database Quick Matching Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Creators in Your Internal Outreach Database
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any creator below to fetch their live Instagram profile & cross-account history.
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
              onClick={() => handleSelectCreator(inf.instagram_handle)}
              className="p-4 rounded-2xl border border-white/[0.08] hover:border-tox-orange/40 hover:bg-tox-orange/[0.04] transition-all cursor-pointer group bg-white/[0.02] flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-tox-orange/10 border border-tox-orange/20 flex items-center justify-center text-tox-orange font-mono font-bold text-xs">
                  @
                </div>
                <div>
                  <div className="text-xs font-semibold font-mono text-white group-hover:text-tox-orange transition-colors">
                    {inf.instagram_handle}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {inf.city ? `${inf.city}, ${inf.state || ''}` : 'Location unassigned'}
                  </div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-tox-orange group-hover:translate-x-0.5 transition-all" />
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
