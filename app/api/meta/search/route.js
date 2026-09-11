import { NextResponse } from 'next/server';
import { db } from '@/lib/db/provider.js';

export const dynamic = 'force-dynamic';

// Curated high-relevance creator directory for real-time Instagram-style search completion
const POPULAR_META_CREATORS = [
  {
    username: 'azfoodie',
    formattedHandle: '@azfoodie',
    displayName: 'The Original Arizona Foodie ™️',
    followerCount: '299K',
    verified: true,
    niche: 'Food, Dining & Wellness',
    location: 'Phoenix, AZ',
    avatarUrl: 'https://instagram.com/azfoodie/',
  },
  {
    username: 'kendalljenner',
    formattedHandle: '@kendalljenner',
    displayName: 'Kendall',
    followerCount: '278M',
    verified: true,
    niche: 'Fashion, Wellness & Tequila 818',
    location: 'Los Angeles, CA',
  },
  {
    username: 'hudabeauty',
    formattedHandle: '@hudabeauty',
    displayName: 'Huda Kattan • Huda Beauty',
    followerCount: '56M',
    verified: true,
    niche: 'Beauty, Skincare & Cosmetics',
    location: 'Dubai / Global',
  },
  {
    username: 'haileybieber',
    formattedHandle: '@haileybieber',
    displayName: 'Hailey Rhode Baldwin Bieber',
    followerCount: '54M',
    verified: true,
    niche: 'Skincare (Rhode) & Aesthetics',
    location: 'Los Angeles, CA',
  },
  {
    username: 'drgulnurbayramli',
    formattedHandle: '@drgulnurbayramli',
    displayName: 'Dr. Gülnur Bayramlı',
    followerCount: '310K',
    verified: true,
    niche: 'Aesthetic Medicine & Dermatology',
    location: 'Baku / International',
  },
  {
    username: 'notboredindc',
    formattedHandle: '@notboredindc',
    displayName: 'Not Bored in DC | history & lifestyle',
    followerCount: '48K',
    verified: false,
    niche: 'Lifestyle & City Culture',
    location: 'Fairfax, VA / Washington, DC',
  },
  {
    username: 'alixearle',
    formattedHandle: '@alixearle',
    displayName: 'Alix Ashley Earle',
    followerCount: '4.1M',
    verified: true,
    niche: 'Lifestyle, Wellness & Podcasts',
    location: 'Miami, FL',
  },
  {
    username: 'marianna_hewitt',
    formattedHandle: '@marianna_hewitt',
    displayName: 'Marianna Hewitt',
    followerCount: '1.1M',
    verified: true,
    niche: 'Beauty & Summer Fridays Co-Founder',
    location: 'Los Angeles, CA',
  },
  {
    username: 'foodgod',
    formattedHandle: '@foodgod',
    displayName: 'Foodgod',
    followerCount: '3.8M',
    verified: true,
    niche: 'Culinary Lifestyle & Hospitality',
    location: 'New York / Miami',
  },
  {
    username: 'emmachamberlain',
    formattedHandle: '@emmachamberlain',
    displayName: 'Emma Chamberlain',
    followerCount: '15M',
    verified: true,
    niche: 'Chamberlain Coffee & Aesthetics',
    location: 'Los Angeles, CA',
  },
  {
    username: 'thetoxtechnique',
    formattedHandle: '@thetoxtechnique',
    displayName: 'The Tox Technique (Official)',
    followerCount: '165K',
    verified: true,
    niche: 'Lymphatic Drainage & Body Sculpting',
    location: 'USA (National)',
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const clean = q.replace(/^@/, '').trim().toLowerCase();

  if (!clean) {
    return NextResponse.json({ results: [] });
  }

  // 1. Fetch internal database influencers
  let dbInfluencers = [];
  try {
    dbInfluencers = await db.getInfluencers();
  } catch (err) {
    console.error('Error querying influencers for search autocomplete:', err);
  }

  const results = [];
  const seenHandles = new Set();

  // A. Internal Database Matches
  for (const inf of dbInfluencers) {
    const handle = (inf.normalized_handle || inf.instagram_handle.replace(/^@/, '')).toLowerCase();
    const name = (inf.display_name || '').toLowerCase();
    const city = (inf.city || '').toLowerCase();
    const niche = (inf.niche || '').toLowerCase();

    if (
      handle.includes(clean) ||
      name.includes(clean) ||
      city.includes(clean) ||
      niche.includes(clean)
    ) {
      if (!seenHandles.has(handle)) {
        seenHandles.add(handle);
        results.push({
          id: inf.id,
          username: handle,
          formattedHandle: `@${handle}`,
          displayName: inf.display_name || handle,
          avatarUrl: inf.avatar_url || null,
          followerCount: inf.follower_count ? inf.follower_count.toLocaleString() : '10K+',
          verified: !!inf.verified,
          niche: inf.niche || 'Creator',
          location: inf.city ? `${inf.city}, ${inf.state || 'USA'}` : null,
          inDatabase: true,
        });
      }
    }
  }

  // B. Popular Creator Directory Matches
  for (const creator of POPULAR_META_CREATORS) {
    const handle = creator.username.toLowerCase();
    const name = creator.displayName.toLowerCase();
    const niche = (creator.niche || '').toLowerCase();
    const location = (creator.location || '').toLowerCase();

    if (
      handle.includes(clean) ||
      name.includes(clean) ||
      niche.includes(clean) ||
      location.includes(clean)
    ) {
      if (!seenHandles.has(handle)) {
        seenHandles.add(handle);
        results.push({
          id: `pop-${handle}`,
          username: handle,
          formattedHandle: `@${handle}`,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl || null,
          followerCount: creator.followerCount,
          verified: creator.verified,
          niche: creator.niche,
          location: creator.location,
          inDatabase: false,
        });
      }
    }
  }

  // C. If the user typed a specific valid handle and it's not already top result,
  // add a dedicated direct "Search Instagram for @handle" action entry
  if (clean.length >= 2 && !seenHandles.has(clean)) {
    results.unshift({
      id: `live-${clean}`,
      username: clean,
      formattedHandle: `@${clean}`,
      displayName: `Instagram Creator @${clean}`,
      avatarUrl: null,
      followerCount: 'Live Meta Query',
      verified: false,
      niche: 'Live Meta Search',
      location: null,
      inDatabase: false,
      isLivePrompt: true,
    });
  }

  // Sort results: exact matches first, then DB matches, then verified
  results.sort((a, b) => {
    if (a.username === clean && b.username !== clean) return -1;
    if (b.username === clean && a.username !== clean) return 1;
    if (a.inDatabase && !b.inDatabase) return -1;
    if (!a.inDatabase && b.inDatabase) return 1;
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    return 0;
  });

  return NextResponse.json({
    query: clean,
    total: results.length,
    results: results.slice(0, 10),
  });
}
