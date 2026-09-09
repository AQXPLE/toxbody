'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Instagram, Users, MapPin, ArrowRight, X } from 'lucide-react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';

export function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [influencers, setInfluencers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      db.getInfluencers().then(setInfluencers);
      db.getAccounts().then(setAccounts);
      db.getLocations().then(setLocations);
      setQuery('');
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Palette Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-[#121318] shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a handle, account, or location..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Influencers Section */}
          {filteredInfluencers.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Influencers
              </div>
              <div className="space-y-1">
                {filteredInfluencers.map((inf) => (
                  <button
                    key={inf.id}
                    onClick={() => handleSelect(`/influencers?handle=${inf.normalized_handle}`)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-mono">
                        @
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200 group-hover:text-amber-300 font-mono">
                          {inf.instagram_handle}
                        </div>
                        <div className="text-[11px] text-zinc-400">{inf.display_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inf.city && (
                        <span className="text-[11px] text-zinc-500 font-sans">{inf.city}, {inf.state}</span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accounts Section */}
          {filteredAccounts.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Marketing Accounts
              </div>
              <div className="space-y-1">
                {filteredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelect(`/accounts`)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Instagram className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200 group-hover:text-amber-300">
                          {acc.account_name}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          @{acc.instagram_handle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locations Section */}
          {filteredLocations.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Locations
              </div>
              <div className="space-y-1">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(`/locations`)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{loc.name}</div>
                        <div className="text-[11px] text-zinc-400">{loc.city}, {loc.state}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
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
                No matching records found for "{query}"
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
