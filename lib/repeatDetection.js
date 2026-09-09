/**
 * Repeat Outreach Detection Engine
 * 
 * Enforces the core business rule:
 * - One Influencer = One Canonical Record
 * - Every Outreach = A distinct historical event
 * - Same Influencer across different accounts = Legitimate Cross-Account outreach
 * - Same Influencer + Same Account = REPEAT outreach (flagged, count tracked, never silently blocked)
 */

/**
 * Analyzes a batch of handles against an account and existing database state.
 * 
 * @param {Object} params
 * @param {Array<Object>} params.handles - Array of normalized handle objects from normalizeHandle()
 * @param {string} params.accountId - The ID of the marketing account doing outreach
 * @param {Array<Object>} params.existingInfluencers - Master influencer records
 * @param {Array<Object>} params.existingOutreach - Prior outreach records
 * @param {Array<Object>} params.marketingAccounts - Accounts directory for name resolution
 * @returns {Object} Comprehensive analysis breakdown for pre-submission preview
 */
export function analyzeOutreachBatch({
  handles,
  accountId,
  existingInfluencers = [],
  existingOutreach = [],
  marketingAccounts = [],
}) {
  const accountMap = new Map(marketingAccounts.map((a) => [a.id, a]));
  const targetAccount = accountMap.get(accountId) || { id: accountId, account_name: 'Selected Account' };

  // Map influencers by normalized handle
  const influencerByNormalized = new Map(
    existingInfluencers.map((inf) => [inf.normalized_handle, inf])
  );

  // Group existing outreach by influencer_id
  const outreachByInfluencer = new Map();
  for (const record of existingOutreach) {
    if (!outreachByInfluencer.has(record.influencer_id)) {
      outreachByInfluencer.set(record.influencer_id, []);
    }
    outreachByInfluencer.get(record.influencer_id).push(record);
  }

  let newInfluencersCount = 0;
  let repeatOutreachCount = 0;
  let crossAccountCount = 0;
  let invalidCount = 0;

  const analyzed = handles.map((item) => {
    if (!item.isValid) {
      invalidCount++;
      return {
        ...item,
        isNewInfluencer: false,
        isRepeatSameAccount: false,
        repeatCountForAccount: 0,
        crossAccountHistory: [],
        statusBadge: 'INVALID',
        badgeColor: 'red',
        summary: item.error || 'Invalid Instagram handle format',
      };
    }

    const influencer = influencerByNormalized.get(item.normalized);

    if (!influencer) {
      newInfluencersCount++;
      return {
        ...item,
        influencerId: null,
        isNewInfluencer: true,
        isRepeatSameAccount: false,
        repeatCountForAccount: 0,
        previousOutreachId: null,
        crossAccountHistory: [],
        statusBadge: 'NEW_INFLUENCER',
        badgeColor: 'emerald',
        summary: 'New influencer — will be registered in master database',
      };
    }

    // Influencer exists in database, inspect prior outreach records
    const allPrior = outreachByInfluencer.get(influencer.id) || [];
    
    // Sort chronologically descending
    const sortedPrior = [...allPrior].sort((a, b) => {
      const dateA = new Date(a.outreach_date || a.submitted_at || a.created_at || 0);
      const dateB = new Date(b.outreach_date || b.submitted_at || b.created_at || 0);
      return dateB - dateA;
    });

    const sameAccountPrior = sortedPrior.filter((r) => r.account_id === accountId);
    const otherAccountPrior = sortedPrior.filter((r) => r.account_id !== accountId);

    if (sameAccountPrior.length > 0) {
      // CASE B: Same Account Repeat Outreach
      repeatOutreachCount++;
      const lastOutreach = sameAccountPrior[0];
      const repeatCount = sameAccountPrior.length;

      return {
        ...item,
        influencerId: influencer.id,
        isNewInfluencer: false,
        isRepeatSameAccount: true,
        repeatCountForAccount: repeatCount,
        previousOutreachId: lastOutreach.id,
        lastOutreachDate: lastOutreach.outreach_date || lastOutreach.submitted_at || null,
        crossAccountHistory: otherAccountPrior.map((r) => ({
          accountName: accountMap.get(r.account_id)?.account_name || 'Other Account',
          date: r.outreach_date || r.submitted_at || null,
          status: r.status,
        })),
        statusBadge: 'REPEAT_SAME_ACCOUNT',
        badgeColor: 'amber',
        summary: `Repeat outreach: contacted ${repeatCount} time(s) previously from ${targetAccount.account_name}`,
      };
    }

    if (otherAccountPrior.length > 0) {
      // CASE A: Cross-Account Legitimate Outreach
      crossAccountCount++;
      const otherNames = [
        ...new Set(otherAccountPrior.map((r) => accountMap.get(r.account_id)?.account_name || 'Other Account')),
      ];

      return {
        ...item,
        influencerId: influencer.id,
        isNewInfluencer: false,
        isRepeatSameAccount: false,
        repeatCountForAccount: 0,
        previousOutreachId: null,
        crossAccountHistory: otherAccountPrior.map((r) => ({
          accountName: accountMap.get(r.account_id)?.account_name || 'Other Account',
          date: r.outreach_date || r.submitted_at || null,
          status: r.status,
        })),
        statusBadge: 'CROSS_ACCOUNT_LEGITIMATE',
        badgeColor: 'blue',
        summary: `Legitimate cross-account: previously contacted via ${otherNames.join(', ')}`,
      };
    }

    // Influencer exists but has no outreach yet
    return {
      ...item,
      influencerId: influencer.id,
      isNewInfluencer: false,
      isRepeatSameAccount: false,
      repeatCountForAccount: 0,
      previousOutreachId: null,
      crossAccountHistory: [],
      statusBadge: 'FIRST_OUTREACH',
      badgeColor: 'emerald',
      summary: `Existing influencer profile — first outreach from ${targetAccount.account_name}`,
    };
  });

  return {
    targetAccount,
    totalHandles: handles.length,
    validHandles: handles.length - invalidCount,
    newInfluencersCount,
    repeatOutreachCount,
    crossAccountCount,
    invalidCount,
    analyzedHandles: analyzed,
  };
}
