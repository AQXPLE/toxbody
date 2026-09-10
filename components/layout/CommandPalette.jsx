'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Instagram, Users, MapPin, ArrowRight, X, Sparkles } from 'lucide-react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { InstagramProfileViewer } from '@/components/meta/InstagramProfileViewer.jsx';

export function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [influencers, setInfluencers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeMetaHandle, setActiveMetaHandle] = useState(null);

  useEffect(() => {
    if (isOpen) {
      db.getInfluencers().then(setInfluencers);
      db.getAccounts().then(setAccounts);
      db.getLocations().then(setLocations);
      setQuery('');
      setActiveMetaHandle(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim().replace(/^@/, '');

  const filteredInfluencers = cleanQuery
    ? influencers
        .filter(
          (i) =>
            i.normalized_handle.includes(cleanQuery) ||
            (i.display_name && i.display_name.toLowerCase().includes(cleanQuery)) ||
            (i.city && i.city.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 5)
    : influencers.slice(0, 4);

  const filteredAccounts = cleanQuery
    ? accounts
        .filter(
          (a) =>
            a.account_name.toLowerCase().includes(cleanQuery) ||
            a.instagram_handle.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 4)
    : accounts.slice(0, 3);

  const filteredLocations = cleanQuery
    ? locations
        .filter(
          (l) =>
            l.name.toLowerCase().includes(cleanQuery) ||
            (l.city && l.city.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 3)
    : [];

  const handleSelect = (url) => {
    onClose();
    router.push(url);
  };

  const handleOpenMetaProfile = (handle) => {
    setActiveMetaHandle(handle);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

        {/* Palette Modal */}
        <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl transition-all">
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 bg-zinc-50/50">
            <Search className="h-5 w-5 text-[#ff5500] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any creator, @handle, account, or location..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-500 shadow-2xs">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Instant In-App Meta Search Option */}
            {cleanQuery && (
              <div className="p-1">
                <button
                  onClick={() => handleOpenMetaProfile(`@${cleanQuery}`)}
                  className="w-full flex items-center justify-between rounded-2xl p-3.5 border border-orange-200 bg-orange-50 hover:bg-orange-100/70 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#ff5500] text-white flex items-center justify-center shadow-xs">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-zinc-950 font-mono flex items-center gap-1.5">
                        <span>Inspect Meta / Instagram Profile for</span>
                        <span className="text-[#ff5500]">@{cleanQuery}</span>
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        Launch in-app Instagram viewer with followers, posts & outreach dossier
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#ff5500] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* Influencers Section */}
            {filteredInfluencers.length > 0 && (
              <div>
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Registered Influencers
                </div>
                <div className="space-y-1">
                  {filteredInfluencers.map((inf) => (
                    <button
                      key={inf.id}
                      onClick={() => handleOpenMetaProfile(inf.instagram_handle)}
                      className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 text-[#ff5500] font-bold flex items-center justify-center text-xs font-mono">
                          @
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 group-hover:text-[#ff5500] font-mono">
                            {inf.instagram_handle}
                          </div>
                          <div className="text-[11px] text-zinc-500">{inf.display_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {inf.city && (
                          <span className="text-[11px] text-zinc-500">{inf.city}, {inf.state}</span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accounts Section */}
            {filteredAccounts.length > 0 && (
              <div>
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Marketing Accounts
                </div>
                <div className="space-y-1">
                  {filteredAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelect(`/accounts`)}
                      className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500]">
                          <Instagram className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 group-hover:text-[#ff5500]">
                            {acc.account_name}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            @{acc.instagram_handle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Locations Section */}
            {filteredLocations.length > 0 && (
              <div>
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Locations
                </div>
                <div className="space-y-1">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(`/locations`)}
                      className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{loc.name}</div>
                          <div className="text-[11px] text-zinc-500">{loc.city}, {loc.state}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cleanQuery &&
              filteredInfluencers.length === 0 &&
              filteredAccounts.length === 0 &&
              filteredLocations.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No internal records matched "{query}". Click the Instagram option above to view their live profile!
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Direct In-App Instagram Profile Viewer Modal */}
      {activeMetaHandle && (
        <InstagramProfileViewer
          handle={activeMetaHandle}
          onClose={() => setActiveMetaHandle(null)}
        />
      )}
    </>
  );
}
