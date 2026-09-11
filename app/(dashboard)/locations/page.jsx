'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { MapPin, Plus, Instagram, Users, Sparkles } from 'lucide-react';

export default function LocationsPage() {
  const { addToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [locs, accs, infs] = await Promise.all([
      db.getLocations(),
      db.getAccounts(),
      db.getInfluencers(),
    ]);
    setLocations(locs);
    setAccounts(accs);
    setInfluencers(infs);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newLoc = await db.createLocation({
        name: name.trim(),
        city: city.trim() || name.trim(),
        state: state.trim().toUpperCase(),
      });

      addToast({
        title: 'Location Created',
        message: `Location "${newLoc.name}" registered successfully.`,
        type: 'success',
      });

      setIsCreateOpen(false);
      setName('');
      setCity('');
      setState('');
      loadData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-tox-orange" />
            <span>Target Markets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Operating Geographic Locations
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Regions, cities, and markets where The Tox Technique operates local marketing accounts and influencer partnerships.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black font-semibold text-xs shadow-tox-orange transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const linkedAccounts = accounts.filter((a) => a.location_id === loc.id);
          const linkedInfluencers = influencers.filter((i) => i.primary_location_id === loc.id);

          return (
            <div
              key={loc.id}
              className="glass-panel rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all shadow-xl group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-tox-orange/10 border border-tox-orange/20 flex items-center justify-center text-tox-orange shadow-inner">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-tox-orange transition-colors">
                      {loc.name}
                    </h3>
                    <div className="text-xs text-zinc-400 font-medium">
                      {loc.city}, {loc.state} • {loc.country || 'USA'}
                    </div>
                  </div>
                </div>
                <Badge variant="success" size="xs">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06] text-xs">
                <div className="p-3 rounded-2xl bg-obsidian-900/80 border border-white/[0.06]">
                  <div className="text-[10px] uppercase font-mono font-medium text-zinc-400 flex items-center gap-1.5">
                    <Instagram className="h-3 w-3 text-tox-orange" /> Accounts
                  </div>
                  <div className="font-mono font-bold text-lg text-white mt-1">
                    {linkedAccounts.length}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-obsidian-900/80 border border-white/[0.06]">
                  <div className="text-[10px] uppercase font-mono font-medium text-zinc-400 flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-blue-400" /> Influencers
                  </div>
                  <div className="font-mono font-bold text-lg text-white mt-1">
                    {linkedInfluencers.length}
                  </div>
                </div>
              </div>

              {linkedAccounts.length > 0 && (
                <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-medium text-zinc-500">Accounts:</span>
                  {linkedAccounts.map((a) => (
                    <span
                      key={a.id}
                      className="text-tox-orange font-mono font-medium bg-tox-orange/10 px-2 py-0.5 rounded-md border border-tox-orange/20"
                    >
                      @{a.instagram_handle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Location Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Geographic Location"
        description="Define a new market for account and influencer linking."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Location / Market Name (e.g. Southlake, Sugar Land, Riverton)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sugar Land"
              className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sugar Land"
                className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">State Code</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all cursor-pointer"
            >
              Save Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
