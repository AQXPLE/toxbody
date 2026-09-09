/**
 * Instagram Handle Normalization Utility
 * 
 * Requirements:
 * - @JaneSmith -> janesmith
 * - janesmith -> janesmith
 * - JANEsmith -> janesmith
 * - https://instagram.com/janesmith -> janesmith
 * - https://www.instagram.com/janesmith/ -> janesmith
 * - https://instagram.com/janesmith?igshid=xyz -> janesmith
 * 
 * Display canonical format: @janesmith
 * Storage canonical normalized: janesmith
 */

/**
 * Normalizes a single Instagram handle or profile URL
 * @param {string} input - Raw user input handle or URL
 * @returns {{
 *   raw: string,
 *   normalized: string,
 *   formatted: string,
 *   url: string,
 *   isValid: boolean,
 *   error?: string
 * }}
 */
export function normalizeHandle(input) {
  if (!input || typeof input !== 'string') {
    return {
      raw: input || '',
      normalized: '',
      formatted: '',
      url: '',
      isValid: false,
      error: 'Empty or invalid input',
    };
  }

  const rawTrimmed = input.trim();
  let cleaned = rawTrimmed;

  // 1. Remove leading/trailing quotes or markdown
  cleaned = cleaned.replace(/^["'`<]+|["'`>]+$/g, '');

  // 2. Strip URL components if present
  try {
    if (cleaned.includes('instagram.com/')) {
      const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      const pathname = urlObj.pathname;
      // path might be /username/ or /username
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        cleaned = segments[0];
      }
    }
  } catch (e) {
    // If URL parsing fails, regex fallback
    cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/?/i, '');
  }

  // 3. Remove query parameters and hash
  cleaned = cleaned.split('?')[0].split('#')[0];

  // 4. Remove leading @ symbol and any trailing slashes or punctuation
  cleaned = cleaned.replace(/^@+/, '').replace(/\/+$/, '').trim();

  // 5. Case-fold to lowercase
  const normalized = cleaned.toLowerCase();

  // 6. Validate handle characters
  // Instagram handles can contain only letters, numbers, periods, and underscores, length 1-30
  const igRegex = /^[a-zA-Z0-9._]{1,30}$/;
  const isValid = igRegex.test(normalized) && !normalized.includes('..');

  let error = undefined;
  if (!isValid) {
    if (normalized.length === 0) {
      error = 'Handle is empty after cleanup';
    } else if (normalized.length > 30) {
      error = 'Handle exceeds 30 characters';
    } else if (normalized.includes('..')) {
      error = 'Handle cannot contain consecutive periods';
    } else {
      error = 'Contains invalid characters (only a-z, 0-9, ., _ allowed)';
    }
  }

  return {
    raw: rawTrimmed,
    normalized: isValid ? normalized : normalized,
    formatted: isValid ? `@${normalized}` : (normalized ? `@${normalized}` : ''),
    url: isValid ? `https://www.instagram.com/${normalized}/` : '',
    isValid,
    error,
  };
}

/**
 * Extracts and normalizes handles from a bulk text input (newlines, commas, spaces)
 * @param {string} bulkText - Multiline or delimited string of handles
 * @returns {Array<{
 *   raw: string,
 *   normalized: string,
 *   formatted: string,
 *   url: string,
 *   isValid: boolean,
 *   error?: string
 * }>}
 */
export function extractAndNormalizeHandles(bulkText) {
  if (!bulkText || typeof bulkText !== 'string') return [];

  // Split on newlines, commas, tabs, semicolons
  const lines = bulkText.split(/[\r\n,;\t]+/);
  const results = [];
  const seenNormalized = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const normalizedObj = normalizeHandle(trimmed);
    
    // Avoid exact duplicate handles in the same batch submission
    if (normalizedObj.isValid && seenNormalized.has(normalizedObj.normalized)) {
      continue;
    }
    
    if (normalizedObj.isValid) {
      seenNormalized.add(normalizedObj.normalized);
    }

    results.push(normalizedObj);
  }

  return results;
}
