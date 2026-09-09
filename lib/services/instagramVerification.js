/**
 * Meta / Instagram Verification Service Abstraction
 * 
 * Provides official Meta Graph API integration with robust defensive fallbacks.
 * Never performs fragile web scraping.
 * Gracefully reports:
 * - API unavailable / unconfigured
 * - Permission restrictions
 * - Rate limiting
 * - Profile private or not found
 */

import { normalizeHandle } from '../normalization.js';

/**
 * Checks external verification status for an Instagram handle
 * @param {string} rawHandle 
 * @returns {Promise<{
 *   verified: boolean,
 *   status: 'available' | 'unavailable' | 'restricted' | 'not_found' | 'error',
 *   statusMessage: string,
 *   profileData?: {
 *     username: string,
 *     name?: string,
 *     profilePictureUrl?: string,
 *     isVerifiedBadge?: boolean,
 *     followerCount?: number,
 *   },
 *   metaConfigured: boolean,
 * }>}
 */
export async function verifyInstagramProfile(rawHandle) {
  const norm = normalizeHandle(rawHandle);
  if (!norm.isValid) {
    return {
      verified: false,
      status: 'error',
      statusMessage: 'Malformed Instagram handle format',
      metaConfigured: false,
    };
  }

  const accessToken = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;

  // If Meta API credentials are not configured, return clear architectural notice
  if (!accessToken || !appId) {
    return {
      verified: false,
      status: 'unavailable',
      statusMessage: 'External verification unavailable (Meta Graph API credentials not configured in environment)',
      metaConfigured: false,
      profileData: {
        username: norm.normalized,
        profileUrl: norm.url,
      },
    };
  }

  try {
    // Official Instagram Basic Display / Graph API call structure
    // Example: GET https://graph.facebook.com/v20.0/{instagram_business_account_id}?fields=biography,followers_count,follows_count,media_count,name,profile_picture_url,username
    const endpoint = `https://graph.facebook.com/v20.0/ig_user?fields=username,name,profile_picture_url,is_verified&access_token=${accessToken}&q=${norm.normalized}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        verified: false,
        status: 'restricted',
        statusMessage: 'External verification unavailable (Meta API permission or scope restricted)',
        metaConfigured: true,
      };
    }

    if (response.status === 429) {
      return {
        verified: false,
        status: 'restricted',
        statusMessage: 'Meta API rate limit reached. Please try again later.',
        metaConfigured: true,
      };
    }

    if (response.status === 404) {
      return {
        verified: false,
        status: 'not_found',
        statusMessage: 'Account not found on Instagram (may be deleted or handle changed)',
        metaConfigured: true,
      };
    }

    if (!response.ok) {
      return {
        verified: false,
        status: 'error',
        statusMessage: `External verification unavailable (HTTP ${response.status})`,
        metaConfigured: true,
      };
    }

    const data = await response.json();
    return {
      verified: !!data.is_verified,
      status: 'available',
      statusMessage: 'Verified via Meta Graph API',
      metaConfigured: true,
      profileData: {
        username: data.username || norm.normalized,
        name: data.name,
        profilePictureUrl: data.profile_picture_url,
        isVerifiedBadge: !!data.is_verified,
        followerCount: data.followers_count || 0,
      },
    };
  } catch (err) {
    return {
      verified: false,
      status: 'error',
      statusMessage: `External verification unavailable (${err.message})`,
      metaConfigured: true,
    };
  }
}
