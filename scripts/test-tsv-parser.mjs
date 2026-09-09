/**
 * Automated Verification Script: TSV Migration Parser & Sample Data Ingestion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseLegacyTsv } from '../lib/tsvParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const notbored = result.uniqueInfluencers.find(i => i.normalized_handle === 'notboredindc');
console.log('\nAudit Influencer "@notboredindc":', notbored);
if (notbored && notbored.accounts_found.length >= 2) {
  console.log('✓ PASS: @notboredindc recognized across multiple account contexts:', notbored.accounts_found);
}

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
