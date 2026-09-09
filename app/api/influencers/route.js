import { NextResponse } from 'next/server';
import { db } from '@/lib/db/provider.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const locationId = searchParams.get('location_id');

    const influencers = await db.getInfluencers({
      search,
      location_id: locationId,
    });

    return NextResponse.json({ influencers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
