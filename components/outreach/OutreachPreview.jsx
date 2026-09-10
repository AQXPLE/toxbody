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
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-5 shadow-tox-lg animate-in fade-in-50">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
            <span>Pre-Submission Verification Preview</span>
            <Badge variant="primary" size="xs">
              Account: {targetAccount.account_name}
            </Badge>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
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
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3 text-xs text-orange-900">
          <AlertTriangle className="h-4 w-4 text-[#ff5500] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-orange-950">
              {repeatOutreachCount} repeat outreach record(s) detected for {targetAccount.account_name}.
            </span>
            <p className="text-zinc-600">
              Per policy, repeat outreach is preserved as a new historical event, flagged with repeat count, and not blocked.
            </p>
          </div>
        </div>
      )}

      {/* Itemized List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-zinc-50/60">
        {analyzedHandles.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-white transition-colors"
            >
              {/* Handle & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-zinc-400 text-[11px] w-6 text-right font-medium">
                  {idx + 1}.
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900">
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
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {item.summary}
                    {item.lastOutreachDate && (
                      <span className="text-zinc-400 ml-1.5 font-medium">
                        (Last: {formatShortDate(item.lastOutreachDate)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Tag */}
              <div className="shrink-0 text-right">
                {item.isRepeatSameAccount ? (
                  <span className="text-[#ff5500] font-mono text-[11px] font-bold">
                    REPEAT
                  </span>
                ) : item.isNewInfluencer ? (
                  <span className="text-emerald-600 font-mono text-[11px] font-bold">
                    NEW
                  </span>
                ) : (
                  <span className="text-blue-600 font-mono text-[11px] font-bold">
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
          className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Modify Batch
        </button>

        <button
          type="button"
          disabled={isSubmitting || validHandles === 0}
          onClick={onConfirm}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white text-xs font-bold shadow-tox-orange transition-all disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSubmitting ? 'Logging Outreach...' : `Confirm & Log ${validHandles} Records`}</span>
        </button>
      </div>
    </div>
  );
}
