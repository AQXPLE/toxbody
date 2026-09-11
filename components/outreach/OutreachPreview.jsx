'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Share2,
  Send,
  X,
  History,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatShortDate } from '@/lib/utils.js';

export function OutreachPreview({ preview, onConfirm, onCancel, isSubmitting }) {
  if (!preview || !preview.analyzedHandles.length) return null;

  const {
    targetAccount,
    totalHandles,
    validHandles,
    newInfluencersCount,
    repeatOutreachCount,
    crossAccountCount,
    analyzedHandles,
  } = preview;

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-5 animate-in fade-in-50 text-zinc-200">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
            <span>Pre-Submission Verification Preview</span>
            <Badge variant="primary" size="xs">
              Account: {targetAccount.account_name}
            </Badge>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Review handle validation, master database matches, and repeat detection flags before recording.
          </p>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" size="sm">
            Total: {totalHandles}
          </Badge>
          <Badge variant="success" size="sm">
            ✓ {newInfluencersCount} New
          </Badge>
          {repeatOutreachCount > 0 && (
            <Badge variant="repeat" size="sm">
              ↻ {repeatOutreachCount} Same-Account Repeat{repeatOutreachCount > 1 ? 's' : ''}
            </Badge>
          )}
          {crossAccountCount > 0 && (
            <Badge variant="cross" size="sm">
              ⇄ {crossAccountCount} Cross-Account
            </Badge>
          )}
        </div>
      </div>

      {/* Repeat Alert Banner if repeats are detected */}
      {repeatOutreachCount > 0 && (
        <div className="rounded-2xl border border-tox-orange/30 bg-tox-orange/10 p-4 flex items-start gap-3 text-xs text-zinc-200">
          <AlertTriangle className="h-4 w-4 text-tox-orange shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">
              {repeatOutreachCount} repeat outreach record(s) detected for {targetAccount.account_name}.
            </span>
            <p className="text-zinc-400">
              Per policy, repeat outreach is preserved as a new historical event, flagged with repeat count, and not blocked.
            </p>
          </div>
        </div>
      )}

      {/* Itemized List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.06] rounded-2xl border border-white/10 bg-obsidian-900/60">
        {analyzedHandles.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-white/[0.03] transition-colors"
            >
              {/* Handle & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-zinc-500 text-[11px] w-6 text-right font-medium">
                  {idx + 1}.
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white">
                      {item.formatted || item.raw}
                    </span>
                    {item.isRepeatSameAccount && (
                      <Badge variant="repeat" size="xs">
                        <RotateCcw className="h-2.5 w-2.5" /> Repeat #{item.repeatCountForAccount}
                      </Badge>
                    )}
                    {item.isNewInfluencer && (
                      <Badge variant="success" size="xs">
                        <CheckCircle2 className="h-2.5 w-2.5" /> New Influencer
                      </Badge>
                    )}
                    {!item.isRepeatSameAccount && item.crossAccountHistory?.length > 0 && (
                      <Badge variant="cross" size="xs">
                        <Share2 className="h-2.5 w-2.5" /> Cross-Account
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {item.summary}
                    {item.lastOutreachDate && (
                      <span className="text-zinc-500 ml-1.5 font-medium tabular-nums">
                        (Last: {formatShortDate(item.lastOutreachDate)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Tag */}
              <div className="shrink-0 text-right">
                {item.isRepeatSameAccount ? (
                  <span className="text-tox-orange font-mono text-[11px] font-bold">
                    REPEAT
                  </span>
                ) : item.isNewInfluencer ? (
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    NEW
                  </span>
                ) : (
                  <span className="text-sky-400 font-mono text-[11px] font-bold">
                    VALID
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tox-orange"
        >
          Modify Batch
        </button>

        <button
          type="button"
          disabled={isSubmitting || validHandles === 0}
          onClick={onConfirm}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSubmitting ? 'Logging Outreach...' : `Confirm & Log ${validHandles} Records`}</span>
        </button>
      </div>
    </div>
  );
}
