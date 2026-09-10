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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-[11px] font-bold mb-2">
            <MapPin className="h-3 w-3" />
            <span>Target Markets</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            Operating Geographic Locations
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
            Regions, cities, and markets where The Tox Technique operates local marketing accounts and influencer partnerships.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs shadow-tox-orange transition-all"
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
              className="p-6 rounded-3xl border border-zinc-200 bg-white space-y-4 hover:border-zinc-300 transition-all shadow-tox-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500] shadow-xs">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-950">{loc.name}</h3>
                    <div className="text-xs text-zinc-500 font-medium">
                      {loc.city}, {loc.state} • {loc.country || 'USA'}
                    </div>
                  </div>
                </div>
                <Badge variant="success" size="xs">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                    <Instagram className="h-3 w-3 text-[#ff5500]" /> Accounts
                  </div>
                  <div className="font-mono font-black text-lg text-zinc-950 mt-1">
                    {linkedAccounts.length}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-600" /> Influencers
                  </div>
                  <div className="font-mono font-black text-lg text-zinc-950 mt-1">
                    {linkedInfluencers.length}
                  </div>
                </div>
              </div>

              {linkedAccounts.length > 0 && (
                <div className="text-[11px] text-zinc-500 flex flex-wrap gap-1.5 pt-1">
                  <span className="font-bold text-zinc-700">Accounts:</span>
                  {linkedAccounts.map((a) => (
                    <span key={a.id} className="text-[#ff5500] font-mono font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
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
            <label className="text-xs font-bold text-zinc-900 block mb-1">
              Location / Market Name (e.g. Southlake, Sugar Land, Riverton)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sugar Land"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#ff5500]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-900 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sugar Land"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-900 block mb-1">State Code</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#ff5500] uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all"
            >
              Save Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
