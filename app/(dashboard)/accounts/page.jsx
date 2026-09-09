'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { formatShortDate, formatOutreachDate } from '@/lib/utils.js';
import {
  Instagram,
  Plus,
  Users,
  MapPin,
  ExternalLink,
  RotateCcw,
  Clock,
  Search,
} from 'lucide-react';

export default function AccountsPage() {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [outreachRecords, setOutreachRecords] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAccountForHistory, setSelectedAccountForHistory] = useState(null);

  // Form state
  const [accountName, setAccountName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');

  // Search filter
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    loadData();
  }, []);

  const loadData = async () => {
    const [accs, locs, emps, asgs, outs, infs] = await Promise.all([
      db.getAccounts(),
      db.getLocations(),
      db.getEmployees(),
      db.getAssignments(),
      db.getOutreachRecords(),
      db.getInfluencers(),
    ]);
    setAccounts(accs);
    setLocations(locs);
    setEmployees(emps);
    setAssignments(asgs);
    setOutreachRecords(outs);
    setInfluencers(infs);

    if (locs.length > 0 && !locationId) {
      setLocationId(locs[0].id);
    }
  };

  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const influencerMap = new Map(influencers.map((i) => [i.id, i]));

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!accountName.trim() || !instagramHandle.trim()) {
      addToast({ title: 'Validation Error', message: 'Name and handle are required.', type: 'warning' });
      return;
    }

    try {
      const newAcc = await db.createAccount({
        account_name: accountName.trim(),
        instagram_handle: instagramHandle.trim(),
        display_name: displayName.trim() || `The Tox ${accountName.trim()}`,
        location_id: locationId || null,
        notes,
      });

      addToast({
        title: 'Account Created',
        message: `Account "${newAcc.account_name}" created successfully.`,
        type: 'success',
      });

      setIsCreateOpen(false);
      setAccountName('');
      setInstagramHandle('');
      setDisplayName('');
      setNotes('');
      loadData();
    } catch (err) {
      addToast({ title: 'Creation Failed', message: err.message, type: 'error' });
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      acc.account_name.toLowerCase().includes(q) ||
      acc.instagram_handle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Instagram Marketing Accounts</span>
            <Badge variant="primary" size="sm">
              {accounts.length} Accounts
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage Instagram handles, assigned locations, staff access permissions, and outreach performance.
          </p>
        </div>

        {currentUser?.role !== 'staff' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Account</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account name or handle..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70">
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Instagram Handle</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Total Outreach</th>
                <th className="py-3 px-4">Unique Influencers</th>
                <th className="py-3 px-4">Repeat Outreach</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredAccounts.map((acc) => {
                const accOutreach = outreachRecords.filter((o) => o.account_id === acc.id);
                const uniqueInfs = new Set(accOutreach.map((o) => o.influencer_id));
                const repeats = accOutreach.filter((o) => o.is_repeat_same_account);
                const assignedEmps = assignments
                  .filter((asg) => asg.account_id === acc.id)
                  .map((asg) => employeeMap.get(asg.employee_id))
                  .filter(Boolean);

                const latest = accOutreach[0];
                const loc = locationMap.get(acc.location_id);

                return (
                  <tr key={acc.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        <Instagram className="h-3.5 w-3.5 text-amber-400" />
                        <span>{acc.account_name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <a
                        href={`https://www.instagram.com/${acc.instagram_handle}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        @{acc.instagram_handle}
                        <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>

                    <td className="py-3 px-4 text-xs text-zinc-300">
                      {loc ? `${loc.name} (${loc.state})` : '—'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {assignedEmps.length > 0 ? (
                          assignedEmps.map((emp) => (
                            <Badge key={emp.id} variant="default" size="xs">
                              {emp.full_name.split(' ')[0]}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-zinc-500 text-xs">Unassigned</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-zinc-200">
                      {accOutreach.length}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-blue-400">
                      {uniqueInfs.size}
                    </td>

                    <td className="py-3 px-4">
                      {repeats.length > 0 ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> {repeats.length}
                        </Badge>
                      ) : (
                        <span className="text-zinc-500 text-xs">0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">
                      {latest ? (
                        latest.outreach_date ? (
                          formatShortDate(latest.outreach_date)
                        ) : (
                          <Badge variant="historical" size="xs">
                            Historical
                          </Badge>
                        )
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedAccountForHistory(acc)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account History Modal */}
      {selectedAccountForHistory && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAccountForHistory(null)}
          title={`Outreach History: ${selectedAccountForHistory.account_name}`}
          description={`All historical outreach logged under @${selectedAccountForHistory.instagram_handle}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800">
              {outreachRecords.filter((o) => o.account_id === selectedAccountForHistory.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No outreach records recorded for this account.
                </div>
              ) : (
                outreachRecords
                  .filter((o) => o.account_id === selectedAccountForHistory.id)
                  .map((rec) => {
                    const inf = influencerMap.get(rec.influencer_id);
                    const emp = employeeMap.get(rec.employee_id);

                    return (
                      <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-100">
                              {inf?.instagram_handle || '@unknown'}
                            </span>
                            {rec.is_repeat_same_account && (
                              <Badge variant="repeat" size="xs">
                                <RotateCcw className="h-2.5 w-2.5" /> Repeat #{rec.repeat_count_for_account}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Logged by: {emp?.full_name || 'Historical Import'}
                            {rec.notes && ` — "${rec.notes}"`}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono text-zinc-300">
                            {rec.outreach_date ? (
                              formatOutreachDate(rec.outreach_date)
                            ) : (
                              <Badge variant="historical" size="xs">
                                Historical Import
                              </Badge>
                            )}
                          </div>
                          <Badge variant="info" size="xs" className="mt-1">
                            {rec.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Marketing Account"
        description="Add a new Instagram marketing account entity."
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              Internal Account Name (e.g. Sugarland, Alamo)
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Sugarland"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              Instagram Username / Handle
            </label>
            <input
              type="text"
              required
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="thetoxsugarland"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city}, {loc.state})
                </option>
              ))}
            </select>
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
              Save Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
