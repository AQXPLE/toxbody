import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_LOCATIONS,
  INITIAL_ACCOUNTS,
  INITIAL_INFLUENCERS,
} from '../lib/db/seedData.js';

const supabaseUrl = 'https://bqemipbbmjrprgybxpgt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZW1pcGJibWpycHJneWJ4cGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk4NDkyMywiZXhwIjoyMTA0NTYwOTIzfQ.VlwzbMz3jnyipG12Slt5yHpA9nmm9nznYHAHDsmLVR4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log('Seeding Supabase database at:', supabaseUrl);

  // 1. Locations
  console.log('1. Seeding Locations...');
  const { data: existingLocs } = await supabase.from('locations').select('id, name');
  const existingLocNames = new Set((existingLocs || []).map((l) => l.name.toLowerCase()));

  const newLocRows = INITIAL_LOCATIONS.filter((l) => !existingLocNames.has(l.name.toLowerCase())).map((l) => ({
    name: l.name,
    city: l.city,
    state: l.state,
    country: l.country,
    active: l.active,
  }));

  if (newLocRows.length > 0) {
    const { data: insertedLocs, error: locErr } = await supabase.from('locations').insert(newLocRows).select();
    if (locErr) console.error('Location error:', locErr);
    else console.log(`✓ Inserted ${insertedLocs.length} new locations`);
  } else {
    console.log(`✓ Locations already present (${existingLocs.length})`);
  }

  const { data: allLocs } = await supabase.from('locations').select('id, name');
  const locMap = new Map((allLocs || []).map((l) => [l.name.toLowerCase(), l.id]));

  // 2. Marketing Accounts
  console.log('2. Seeding Marketing Accounts...');
  const { data: existingAccs } = await supabase.from('marketing_accounts').select('id, account_name');
  const existingAccNames = new Set((existingAccs || []).map((a) => a.account_name.toLowerCase()));

  const newAccRows = INITIAL_ACCOUNTS.filter((a) => !existingAccNames.has(a.account_name.toLowerCase())).map((a) => ({
    account_name: a.account_name,
    instagram_handle: a.instagram_handle,
    display_name: a.display_name,
    location_id: locMap.get(a.account_name.toLowerCase()) || null,
    active: a.active,
  }));

  if (newAccRows.length > 0) {
    const { data: insertedAccs, error: accErr } = await supabase.from('marketing_accounts').insert(newAccRows).select();
    if (accErr) console.error('Accounts error:', accErr);
    else console.log(`✓ Inserted ${insertedAccs.length} new marketing accounts`);
  } else {
    console.log(`✓ Marketing accounts already present (${existingAccs.length})`);
  }

  const { data: allAccs } = await supabase.from('marketing_accounts').select('id, account_name');
  const accMap = new Map((allAccs || []).map((a) => [a.account_name.toLowerCase(), a.id]));

  // 3. Influencers
  console.log('3. Seeding Influencers...');
  const infRows = INITIAL_INFLUENCERS.map((i) => ({
    instagram_handle: i.instagram_handle,
    normalized_handle: i.normalized_handle,
    instagram_url: i.instagram_url,
    display_name: i.display_name,
    follower_count: i.follower_count || 0,
    niche: i.niche || 'General',
    city: i.city || '',
    state: i.state || '',
    primary_location_id: locMap.get((i.city || '').toLowerCase()) || null,
    verified: !!i.verified,
    source: i.source || 'seed',
  }));
  const { data: infs, error: infErr } = await supabase.from('influencers').upsert(infRows, { onConflict: 'normalized_handle' }).select();
  if (infErr) console.error('Influencers error:', infErr);
  else console.log(`✓ Seeded ${infs.length} master influencers`);

  const infMap = new Map((infs || []).map((i) => [i.normalized_handle, i.id]));

  // 4. Outreach Records
  console.log('4. Seeding Core Outreach Records & Repeat Scenarios...');
  const exampleId = infMap.get('example');
  const alamoAccId = accMap.get('alamo');
  const mckinneyAccId = accMap.get('mckinney');

  const { data: existingOutreach } = await supabase.from('outreach_records').select('id').limit(1);

  if (exampleId && alamoAccId && mckinneyAccId && (!existingOutreach || existingOutreach.length === 0)) {
    // Touchpoint 1: Alamo (New)
    const { data: out1 } = await supabase.from('outreach_records').insert([{
      influencer_id: exampleId,
      account_id: alamoAccId,
      outreach_date: '2026-09-01T14:30:00Z',
      is_repeat_same_account: false,
      repeat_count_for_account: 0,
      status: 'Contacted',
      notes: 'Initial outreach for autumn campaign',
      source: 'submission',
    }]).select().single();

    // Touchpoint 2: McKinney (Cross-Account Legitimate)
    await supabase.from('outreach_records').insert([{
      influencer_id: exampleId,
      account_id: mckinneyAccId,
      outreach_date: '2026-09-03T16:15:00Z',
      is_repeat_same_account: false,
      repeat_count_for_account: 0,
      status: 'Contacted',
      notes: 'Regional outreach from McKinney account',
      source: 'submission',
    }]);

    // Touchpoint 3: Alamo (REPEAT SAME ACCOUNT!)
    if (out1) {
      await supabase.from('outreach_records').insert([{
        influencer_id: exampleId,
        account_id: alamoAccId,
        outreach_date: '2026-10-08T11:00:00Z',
        is_repeat_same_account: true,
        repeat_count_for_account: 1,
        previous_outreach_id: out1.id,
        status: 'Follow-up',
        notes: 'Follow-up from Alamo account (repeat flagged)',
        source: 'submission',
      }]);
    }

    console.log('✓ Seeded core repeat scenario (Daniyal/Ahmed @example with 3 touchpoints)');
  } else {
    console.log('✓ Core outreach records already present.');
  }

  console.log('\n>>> SUPABASE LIVE SEEDING 100% COMPLETE! <<<');
}

runSeed();
