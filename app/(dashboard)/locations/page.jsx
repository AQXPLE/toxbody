'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { MapPin, Plus, Instagram, Users } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Operating Geographic Locations</span>
            <Badge variant="primary" size="sm">
              {locations.length} Locations
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Regions, cities, and markets where The Tox Technique operates marketing accounts and influencer campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const linkedAccounts = accounts.filter((a) => a.location_id === loc.id);
          const linkedInfluencers = influencers.filter((i) => i.primary_location_id === loc.id);

          return (
            <div
              key={loc.id}
              className="p-5 rounded-xl border border-zinc-800 bg-[#121319] space-y-4 hover:border-zinc-700 transition-colors shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{loc.name}</h3>
                    <div className="text-[11px] text-zinc-400">
                      {loc.city}, {loc.state} • {loc.country || 'USA'}
                    </div>
                  </div>
                </div>
                <Badge variant="success" size="xs">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="p-2 rounded bg-zinc-900/50">
                  <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
                    <Instagram className="h-3 w-3 text-amber-400" /> Accounts
                  </div>
                  <div className="font-mono font-bold text-zinc-200 mt-1">
                    {linkedAccounts.length}
                  </div>
                </div>

                <div className="p-2 rounded bg-zinc-900/50">
                  <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-400" /> Influencers
                  </div>
                  <div className="font-mono font-bold text-zinc-200 mt-1">
                    {linkedInfluencers.length}
                  </div>
                </div>
              </div>

              {linkedAccounts.length > 0 && (
                <div className="text-[11px] text-zinc-400 flex flex-wrap gap-1">
                  <span className="text-zinc-500">Accounts:</span>
                  {linkedAccounts.map((a) => (
                    <span key={a.id} className="text-zinc-300 font-mono">
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
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              Location / Market Name (e.g. Southlake, Sugar Land, Riverton)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sugar Land"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sugar Land"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">State Code</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-bold shadow-lg"
            >
              Save Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
