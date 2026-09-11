'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { HandleInput } from '@/components/outreach/HandleInput.jsx';
import { OutreachPreview } from '@/components/outreach/OutreachPreview.jsx';
import { TodayOutreachTable } from '@/components/outreach/TodayOutreachTable.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { Send, Instagram, Calendar, FileText, CheckCircle2, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

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
        message: `Successfully recorded ${result.submittedCount} outreach touches.`,
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

  const selectedAccount = permittedAccounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-[11px] font-semibold mb-2 shadow-xs">
            <Sparkles className="h-3 w-3" />
            <span>Rapid Outreach Logging</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Log Influencer Outreach
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Submit daily outreach batches from your marketing Instagram accounts with instant duplicate detection, canonical matching, and repeat tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            Staff: {currentUser?.full_name} ({currentUser?.role})
          </Badge>
        </div>
      </div>

      {/* Main Submission Form & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <form
            onSubmit={handleGeneratePreview}
            className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            {/* Step 1: Target Marketing Account */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-tox-orange/15 border border-tox-orange/30 text-tox-orange text-[11px] font-bold">
                    1
                  </span>
                  <span>Select Target Marketing Account</span>
                </label>
                <span className="text-[11px] text-zinc-400 font-normal">
                  {currentUser?.role === 'staff' ? 'Assigned accounts only' : 'All accounts accessible'}
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(e.target.value);
                    setPreview(null);
                  }}
                  className="w-full bg-obsidian-900/90 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-tox-orange focus:ring-1 focus:ring-tox-orange/20 transition-all cursor-pointer"
                >
                  {permittedAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-obsidian-950 text-white">
                      {acc.account_name} — @{acc.instagram_handle}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccount && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                  <Instagram className="h-3.5 w-3.5 text-tox-orange" />
                  <span>Outgoing handle:</span>
                  <strong className="font-mono text-zinc-200">@{selectedAccount.instagram_handle}</strong>
                </div>
              )}
            </div>

            {/* Step 2: Handle Input Field */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-tox-orange/15 border border-tox-orange/30 text-tox-orange text-[11px] font-bold">
                  2
                </span>
                <span className="text-xs font-semibold text-white">Enter Influencer Handles</span>
              </div>
              <HandleInput
                value={handlesText}
                onChange={(val) => {
                  setHandlesText(val);
                  setPreview(null);
                }}
                disabled={isAnalyzing || isSubmitting}
              />
            </div>

            {/* Step 3: Status & Optional Notes */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-tox-orange/15 border border-tox-orange/30 text-tox-orange text-[11px] font-bold">
                  3
                </span>
                <span className="text-xs font-semibold text-white">Outreach Status & Campaign Context</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-300">Outreach Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-tox-orange"
                  >
                    <option value="Contacted" className="bg-obsidian-950 text-white">Contacted (Direct Message Sent)</option>
                    <option value="Submitted" className="bg-obsidian-950 text-white">Submitted (Pending Send)</option>
                    <option value="Follow-up" className="bg-obsidian-950 text-white">Follow-up</option>
                    <option value="Replied" className="bg-obsidian-950 text-white">Replied</option>
                    <option value="Interested" className="bg-obsidian-950 text-white">Interested</option>
                    <option value="Not Interested" className="bg-obsidian-950 text-white">Not Interested</option>
                    <option value="No Response" className="bg-obsidian-950 text-white">No Response</option>
                    <option value="Closed" className="bg-obsidian-950 text-white">Closed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-300">Campaign Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. VIP Lymphatic Drainage Promo"
                    className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-tox-orange"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!preview && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                <div className="text-[11px] text-zinc-400 font-normal flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>The system checks duplicate rules before saving to database.</span>
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing || !handlesText.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black font-semibold text-xs shadow-tox-orange transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isAnalyzing ? 'Analyzing Batch...' : 'Analyze & Preview Batch'}</span>
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
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-tox-orange/10 border border-tox-orange/20 flex items-center justify-center text-tox-orange">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  How The System Works
                </h3>
                <p className="text-[11px] text-zinc-400">Core business rules & definitions</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-tox-orange"></span>
                  <span>1. Canonical Master Influencers</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Every influencer is stored exactly once in the master directory. Handles like <code className="font-mono text-zinc-300 font-medium">@Jane_Doe</code> and <code className="font-mono text-zinc-300 font-medium">jane_doe</code> map to the same creator.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                  <span>2. Cross-Account is Legitimate</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  If Alamo, Southlake, or McKinney reach the same influencer, this is tracked as valid cross-account outreach.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-tox-orange"></span>
                  <span>3. Same-Account Repeats are Flagged</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  If the <em>same</em> marketing account messages a creator multiple times, it is flagged as a Repeat (#2, #3, etc.) and counted in analytics.
                </p>
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
