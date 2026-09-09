import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqemipbbmjrprgybxpgt.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZW1pcGJibWpycHJneWJ4cGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODQ5MjMsImV4cCI6MjEwNDU2MDkyM30.aQZr4rSryy28xcpWxmBmK7ParHXtXH4GeDOnUNUNjBQ';

const supabase = createClient(supabaseUrl, anonKey);

async function testQuery() {
  console.log('Testing live Supabase public anon queries...');

  const { data: locs, error: locErr } = await supabase.from('locations').select('*');
  console.log('Locations count:', locs?.length);

  const { data: accs, error: accErr } = await supabase.from('marketing_accounts').select('*');
  console.log('Accounts count:', accs?.length);

  const { data: infs, error: infErr } = await supabase.from('influencers').select('*');
  console.log('Influencers count:', infs?.length);

  const { data: outs, error: outErr } = await supabase.from('outreach_records').select('*');
  console.log('Outreach count:', outs?.length);

  if (locs?.length > 0 && accs?.length > 0 && infs?.length > 0 && outs?.length > 0) {
    console.log('>>> PUBLIC ANON QUERIES TO SUPABASE 100% WORKING! <<<');
  }
}

testQuery();
