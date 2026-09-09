'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { HandleInput } from '@/components/outreach/HandleInput.jsx';
import { OutreachPreview } from '@/components/outreach/OutreachPreview.jsx';
import { TodayOutreachTable } from '@/components/outreach/TodayOutreachTable.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { Send, Instagram, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function OutreachPage() {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [permittedAccounts, setPermittedAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [handlesText, setHandlesText] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Contacted');
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table feed state
  const [allOutreach, setAllOutreach] = useState([]);
  const [allInfluencers, setAllInfluencers] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    const user = db.getCurrentUser();
    setCurrentUser(user);

    // Fetch accounts permitted for this user role / assignments
    db.getPermittedAccountsForEmployee(user.id).then((accounts) => {
      setPermittedAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    });

    loadData();
  }, []);

  const loadData = async () => {
    const [outreach, influencers, accounts, employees] = await Promise.all([
      db.getOutreachRecords(),
      db.getInfluencers(),
      db.getAccounts(),
      db.getEmployees(),
    ]);
    setAllOutreach(outreach);
    setAllInfluencers(influencers);
    setAllAccounts(accounts);
    setAllEmployees(employees);
  };

  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    if (!selectedAccountId) {
      addToast({ title: 'Account Required', message: 'Please select a marketing account.', type: 'warning' });
      return;
    }
    if (!handlesText.trim()) {
      addToast({ title: 'Handles Required', message: 'Please enter at least one Instagram handle.', type: 'warning' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const previewResult = await db.previewOutreachBatch({
        accountId: selectedAccountId,
        handlesText,
      });
      setPreview(previewResult);
    } catch (err) {
      addToast({ title: 'Analysis Error', message: err.message, type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await db.submitOutreachBatch({
        accountId: selectedAccountId,
        employeeId: currentUser.id,
        handlesText,
        outreachDate: new Date().toISOString(),
        status,
        notes,
      });

      addToast({
        title: 'Outreach Logged Successfully',
        message: `Successfully logged ${result.submittedCount} outreach records.`,
        type: 'success',
      });

      // Clear form & preview
      setHandlesText('');
      setNotes('');
      setPreview(null);
      loadData();
    } catch (err) {
      addToast({ title: 'Submission Failed', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Log Influencer Outreach</span>
            <Badge variant="primary" size="sm">
              Rapid Flow
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Submit daily outreach batches from Instagram accounts with real-time duplicate & repeat detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            Staff: {currentUser?.full_name} ({currentUser?.role})
          </Badge>
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleGeneratePreview}
            className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-5 shadow-xl"
          >
            {/* Account Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-amber-400" />
                  Target Marketing Account
                </span>
                <span className="text-[11px] font-normal text-zinc-400">
                  {currentUser?.role === 'staff' ? 'Assigned accounts only' : 'All accounts accessible (Manager/Admin)'}
                </span>
              </label>

              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setPreview(null); // Reset preview on account change
                }}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
              >
                {permittedAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} — @{acc.instagram_handle}
                  </option>
                ))}
              </select>
            </div>

            {/* Handle Input Field */}
            <HandleInput
              value={handlesText}
              onChange={(val) => {
                setHandlesText(val);
                setPreview(null);
              }}
              disabled={isAnalyzing || isSubmitting}
            />

            {/* Status & Optional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Outreach Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Contacted">Contacted (Direct Message)</option>
                  <option value="Submitted">Submitted (Queued)</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Replied">Replied</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="No Response">No Response</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Batch Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Autumn wellness campaign invite"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Action Button */}
            {!preview && (
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="text-[11px] text-zinc-400">
                  Verification engine checks repeats and canonical database matches before recording.
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing || !handlesText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isAnalyzing ? 'Analyzing Handles...' : 'Analyze & Preview Batch'}</span>
                </button>
              </div>
            )}
          </form>

          {/* Pre-Submission Verification Preview */}
          {preview && (
            <OutreachPreview
              preview={preview}
              onConfirm={handleConfirmSubmit}
              onCancel={() => setPreview(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Operational Guidance Card */}
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-800 bg-[#121319] p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Core Outreach Rules
            </h3>

            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <span className="font-semibold text-amber-300 block mb-1">
                  1. Canonical Influencers
                </span>
                Every handle resolves to one master record regardless of casing, @, or URL format.
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <span className="font-semibold text-blue-300 block mb-1">
                  2. Cross-Account is Legitimate
                </span>
                Reaching the same influencer from Alamo, Southlake, or McKinney is tracked as legitimate multi-account touchpoints.
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <span className="font-semibold text-amber-400 block mb-1">
                  3. Same-Account Repeats are Flagged
                </span>
                Contacting the same handle again from the same account is flagged as a Repeat, counted, and recorded chronologically.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed of Today's Outreach */}
      <TodayOutreachTable
        outreachRecords={allOutreach}
        influencers={allInfluencers}
        accounts={allAccounts}
        employees={allEmployees}
      />
    </div>
  );
}
