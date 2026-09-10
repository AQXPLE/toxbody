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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-[11px] font-bold mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Rapid Outreach Logging</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            Log Influencer Outreach
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
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
            className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-tox-lg"
          >
            {/* Step 1: Target Marketing Account */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-[#ff5500] text-[11px] font-black">
                    1
                  </span>
                  <span>Select Target Marketing Account</span>
                </label>
                <span className="text-[11px] text-zinc-500 font-medium">
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
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/20 transition-all cursor-pointer"
                >
                  {permittedAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} — @{acc.instagram_handle}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccount && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                  <Instagram className="h-3.5 w-3.5 text-[#ff5500]" />
                  <span>Outgoing handle:</span>
                  <strong className="font-mono text-zinc-800">@{selectedAccount.instagram_handle}</strong>
                </div>
              )}
            </div>

            {/* Step 2: Handle Input Field */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-[#ff5500] text-[11px] font-black">
                  2
                </span>
                <span className="text-xs font-bold text-zinc-900">Enter Influencer Handles</span>
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
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-[#ff5500] text-[11px] font-black">
                  3
                </span>
                <span className="text-xs font-bold text-zinc-900">Outreach Status & Campaign Context</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700">Outreach Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="Contacted">Contacted (Direct Message Sent)</option>
                    <option value="Submitted">Submitted (Pending Send)</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Replied">Replied</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="No Response">No Response</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700">Campaign Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. VIP Lymphatic Drainage Promo"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!preview && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100">
                <div className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>The system checks duplicate rules before saving to database.</span>
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing || !handlesText.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs shadow-tox-orange transition-all disabled:opacity-50"
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
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-5 shadow-tox-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center text-[#ff5500]">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-950">
                  How The System Works
                </h3>
                <p className="text-[11px] text-zinc-500">Core business rules & definitions</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff5500]"></span>
                  <span>1. Canonical Master Influencers</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Every influencer is stored exactly once in the master directory. Handles like <code className="font-mono text-zinc-800 font-semibold">@Jane_Doe</code> and <code className="font-mono text-zinc-800 font-semibold">jane_doe</code> map to the same creator.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>2. Cross-Account is Legitimate</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  If Alamo, Southlake, or McKinney reach the same influencer, this is tracked as valid cross-account outreach.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff5500]"></span>
                  <span>3. Same-Account Repeats are Flagged</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
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
