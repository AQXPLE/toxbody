/**
 * Messy TSV & CSV Migration Parser
 * 
 * Specifically designed to handle legacy spreadsheets like `influencer track - Sheet1.tsv`
 * where:
 * 1. Column headers are initial account/location names.
 * 2. Cells contain handles (@handle), but also mid-column account/location names.
 * 3. Some cells may be empty or ambiguous.
 * 4. The same influencer can appear under multiple accounts.
 * 5. Dates are null/unavailable (Historical import).
 */

import { normalizeHandle } from './normalization.js';

// Known accounts / locations commonly appearing in legacy sheets
export const KNOWN_LOCATIONS_ACCOUNTS = [
  'fairfax',
  'palmbeach',
  'palm beach',
  'denver',
  'southlake',
  'alamo',
  'riverton',
  'scottsdale',
  'chandler',
  'mckinney',
  'sugarland',
  'sugar land',
  'dallas',
  'austin',
  'houston',
];

/**
 * Checks if a cell string represents an account or location header rather than an influencer
 * @param {string} text 
 * @returns {boolean}
 */
export function isAccountOrLocationName(text) {
  if (!text || typeof text !== 'string') return false;
  const cleaned = text.trim().toLowerCase();
  // If it starts with @, it is an influencer handle, not an account header
  if (text.trim().startsWith('@')) return false;

  // Check against known location/account strings
  return KNOWN_LOCATIONS_ACCOUNTS.includes(cleaned);
}

/**
 * Parses raw TSV text and structures it into columns and staged import rows
 * @param {string} rawContent 
 * @param {Array<Object>} existingAccounts 
 * @returns {Object} Parse result summary & structured rows
 */
export function parseLegacyTsv(rawContent, existingAccounts = []) {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      success: false,
      error: 'No content provided',
      columns: [],
      rows: [],
      influencers: [],
      ambiguousRows: [],
    };
  }

  const lines = rawContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      success: false,
      error: 'File is empty',
      columns: [],
      rows: [],
      influencers: [],
      ambiguousRows: [],
    };
  }

  // Row 1: Header names
  const headerLine = lines[0];
  const headers = headerLine.split('\t').map((h) => h.trim());

  // Track active account for each column index
  const activeAccountByCol = {};
  headers.forEach((h, colIndex) => {
    activeAccountByCol[colIndex] = h;
  });

  const parsedOutreachEntries = [];
  const ambiguousEntries = [];
  const uniqueInfluencersMap = new Map();

  // Iterate from row 1 (0-indexed line 1) downwards
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const cells = lines[rowIndex].split('\t');

    // Process each column
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const cellValue = (cells[colIndex] || '').trim();
      if (!cellValue) continue;

      // Check if cell is an account/location switch
      if (isAccountOrLocationName(cellValue)) {
        // Update active account for this column moving forward
        activeAccountByCol[colIndex] = cellValue;
        continue;
      }

      // Check if cell has an @ handle or looks like an IG username
      const norm = normalizeHandle(cellValue);

      if (cellValue.startsWith('@') || (norm.isValid && !cellValue.includes(' '))) {
        const currentAccount = activeAccountByCol[colIndex] || headers[colIndex] || 'Unknown';
        
        // Track unique influencer
        if (!uniqueInfluencersMap.has(norm.normalized)) {
          uniqueInfluencersMap.set(norm.normalized, {
            instagram_handle: norm.formatted,
            normalized_handle: norm.normalized,
            source: 'historical_import',
            accounts_found: [currentAccount],
          });
        } else {
          uniqueInfluencersMap.get(norm.normalized).accounts_found.push(currentAccount);
        }

        parsedOutreachEntries.push({
          rowIndex: rowIndex + 1,
          colIndex,
          rawCell: cellValue,
          handle: norm.formatted,
          normalizedHandle: norm.normalized,
          accountContext: currentAccount,
          headerContext: headers[colIndex],
          isRepeat: false, // Calculated later against historical account occurrences
          status: 'valid',
        });
      } else {
        // Ambiguous cell (e.g. text that doesn't start with @ and isn't a known account)
        ambiguousEntries.push({
          rowIndex: rowIndex + 1,
          colIndex,
          rawCell: cellValue,
          columnHeader: headers[colIndex],
          currentAccountContext: activeAccountByCol[colIndex],
          reason: 'Ambiguous text: does not start with @ and is not a known account name',
          suggestedAction: 'review',
        });
      }
    }
  }

  // Calculate repeats within the parsed outreach entries:
  // An entry is a same-account repeat if the same normalized handle has already appeared
  // under the same normalized account earlier in the import.
  const seenAccountHandlePairs = new Map();
  const processedOutreaches = parsedOutreachEntries.map((entry) => {
    const key = `${entry.accountContext.toLowerCase()}::${entry.normalizedHandle}`;
    const previousCount = seenAccountHandlePairs.get(key) || 0;
    const isRepeat = previousCount > 0;
    seenAccountHandlePairs.set(key, previousCount + 1);

    return {
      ...entry,
      isRepeatSameAccount: isRepeat,
      repeatCount: previousCount,
    };
  });

  return {
    success: true,
    totalRows: lines.length - 1,
    headers,
    totalEntries: processedOutreaches.length,
    uniqueInfluencersCount: uniqueInfluencersMap.size,
    uniqueInfluencers: Array.from(uniqueInfluencersMap.values()),
    outreaches: processedOutreaches,
    ambiguousCount: ambiguousEntries.length,
    ambiguousRows: ambiguousEntries,
  };
}
