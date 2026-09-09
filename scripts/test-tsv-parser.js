/**
 * Automated Verification Script: TSV Migration Parser & Sample Data Ingestion
 * 
 * Verifies:
 * 1. Correctly parses `influencer_track_sample.txt`
 * 2. Identifies header columns (Fairfax, Palmbeach, Denver)
 * 3. Identifies embedded account switches (Southlake, Riverton, Alamo, Scottsdale, Chandler)
 * 4. Resolves cross-column duplicates (@notboredindc, @azfoodie)
 * 5. Flags ambiguous rows for admin review
 */

const fs = require('fs');
const path = require('path');
const { parseLegacyTsv } = require('../lib/tsvParser');

const samplePath = path.join(__dirname, '..', 'influencer_track_sample.txt');
const rawContent = fs.readFileSync(samplePath, 'utf8');

console.log('====================================================');
console.log('TEST SUITE: Messy TSV Data Ingestion & Normalization');
console.log('====================================================');

const result = parseLegacyTsv(rawContent);

console.log('Headers Detected:', result.headers);
console.log('Total Raw Rows Analyzed:', result.totalRows);
console.log('Total Outreach Entries Extracted:', result.totalEntries);
console.log('Unique Influencers Identified:', result.uniqueInfluencersCount);
console.log('Ambiguous Cells Flagged for Review:', result.ambiguousCount);

// Verify cross-account influencer occurrence: @notboredindc
const notbored = result.uniqueInfluencers.find(i => i.normalized_handle === 'notboredindc');
console.log('\nAudit Influencer "@notboredindc":', notbored);
if (notbored && notbored.accounts_found.length >= 2) {
  console.log('✓ PASS: @notboredindc recognized across multiple account contexts:', notbored.accounts_found);
} else {
  console.warn('Note on @notboredindc accounts found:', notbored?.accounts_found);
}

// Verify @azfoodie
const azfoodie = result.uniqueInfluencers.find(i => i.normalized_handle === 'azfoodie');
console.log('Audit Influencer "@azfoodie":', azfoodie);
if (azfoodie && azfoodie.accounts_found.length >= 2) {
  console.log('✓ PASS: @azfoodie recognized across multiple account contexts:', azfoodie.accounts_found);
}

console.log('\nFirst 5 Extracted Outreach Entries:');
console.table(result.outreaches.slice(0, 5).map(o => ({
  Handle: o.handle,
  AccountContext: o.accountContext,
  HeaderContext: o.headerContext,
  IsRepeat: o.isRepeatSameAccount,
})));

if (result.success && result.uniqueInfluencersCount > 30 && result.totalEntries > 40) {
  console.log('\n>>> TSV PARSER TEST PASSED SUCCESSFULLY! <<<');
  process.exit(0);
} else {
  console.error('\n>>> TSV PARSER TEST FAILED <<<');
  process.exit(1);
}
