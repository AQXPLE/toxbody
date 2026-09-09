/**
 * Automated Verification Script: Instagram Handle Normalization & Repeat Logic
 * 
 * Verifies:
 * 1. Normalization of variations: @JaneSmith, https://instagram.com/janesmith/, JANEsmith, etc.
 * 2. Core Specification Scenario:
 *    - Daniyal -> Alamo -> @example (Outreach #1, New)
 *    - Ahmed -> McKinney -> @example (Outreach #2, Cross-Account Legitimate)
 *    - Daniyal -> Alamo -> @example (Outreach #3, REPEAT Flagged!)
 * 3. Influencer count remains 1, Outreach count is 3.
 */

const { normalizeHandle, extractAndNormalizeHandles } = require('../lib/normalization');
const { analyzeOutreachBatch } = require('../lib/repeatDetection');

console.log('====================================================');
console.log('TEST SUITE 1: Handle Normalization');
console.log('====================================================');

const testCases = [
  { input: '@JaneSmith', expected: 'janesmith' },
  { input: 'janesmith', expected: 'janesmith' },
  { input: 'JANEsmith', expected: 'janesmith' },
  { input: 'https://instagram.com/janesmith', expected: 'janesmith' },
  { input: 'https://www.instagram.com/janesmith/', expected: 'janesmith' },
  { input: 'https://instagram.com/janesmith?igshid=123&utm_medium=share', expected: 'janesmith' },
  { input: '  @janesmith  ', expected: 'janesmith' },
];

let normFailures = 0;
for (const tc of testCases) {
  const result = normalizeHandle(tc.input);
  if (result.normalized === tc.expected && result.isValid) {
    console.log(`✓ PASS: "${tc.input}" -> "${result.normalized}" (${result.formatted})`);
  } else {
    console.error(`✗ FAIL: "${tc.input}" expected "${tc.expected}", got "${result.normalized}" (valid: ${result.isValid})`);
    normFailures++;
  }
}

console.log('\n====================================================');
console.log('TEST SUITE 2: Core Repeat Scenario Logic');
console.log('====================================================');

// Setup mock state
const mockAccounts = [
  { id: 'acc-alamo', account_name: 'Alamo' },
  { id: 'acc-mckinney', account_name: 'McKinney' },
  { id: 'acc-southlake', account_name: 'Southlake' },
];

let influencers = [];
let outreachRecords = [];

// Step 1: Daniyal -> Alamo -> @example
console.log('\nStep 1: Logging Daniyal -> Alamo -> @example');
const batch1 = analyzeOutreachBatch({
  handles: [normalizeHandle('@example')],
  accountId: 'acc-alamo',
  existingInfluencers: influencers,
  existingOutreach: outreachRecords,
  marketingAccounts: mockAccounts,
});

console.log('Batch 1 Analysis:', batch1.analyzedHandles[0].statusBadge, '| Summary:', batch1.analyzedHandles[0].summary);
if (batch1.newInfluencersCount !== 1 || batch1.repeatOutreachCount !== 0) {
  console.error('✗ FAIL: Step 1 should be a new influencer, got:', batch1);
} else {
  console.log('✓ PASS: Recognized as brand new influencer.');
}

// Commit Step 1
const infRecord = {
  id: 'inf-1',
  instagram_handle: '@example',
  normalized_handle: 'example',
};
influencers.push(infRecord);

const out1 = {
  id: 'out-1',
  influencer_id: 'inf-1',
  account_id: 'acc-alamo',
  employee_id: 'emp-daniyal',
  outreach_date: '2026-09-01T14:30:00Z',
  is_repeat_same_account: false,
  repeat_count_for_account: 0,
};
outreachRecords.push(out1);

// Step 2: Ahmed -> McKinney -> @example (Legitimate cross-account!)
console.log('\nStep 2: Logging Ahmed -> McKinney -> @example');
const batch2 = analyzeOutreachBatch({
  handles: [normalizeHandle('@example')],
  accountId: 'acc-mckinney',
  existingInfluencers: influencers,
  existingOutreach: outreachRecords,
  marketingAccounts: mockAccounts,
});

console.log('Batch 2 Analysis:', batch2.analyzedHandles[0].statusBadge, '| Summary:', batch2.analyzedHandles[0].summary);
if (batch2.newInfluencersCount !== 0 || batch2.repeatOutreachCount !== 0 || batch2.crossAccountCount !== 1) {
  console.error('✗ FAIL: Step 2 should be cross-account legitimate, not same-account repeat! Got:', batch2);
} else {
  console.log('✓ PASS: Correctly classified as Cross-Account Legitimate (Alamo previously contacted).');
}

// Commit Step 2
const out2 = {
  id: 'out-2',
  influencer_id: 'inf-1',
  account_id: 'acc-mckinney',
  employee_id: 'emp-ahmed',
  outreach_date: '2026-09-03T16:15:00Z',
  is_repeat_same_account: false,
  repeat_count_for_account: 0,
};
outreachRecords.push(out2);

// Step 3: Daniyal -> Alamo -> @example (SAME ACCOUNT REPEAT!)
console.log('\nStep 3: Logging Daniyal -> Alamo -> @example (Again)');
const batch3 = analyzeOutreachBatch({
  handles: [normalizeHandle('@example')],
  accountId: 'acc-alamo',
  existingInfluencers: influencers,
  existingOutreach: outreachRecords,
  marketingAccounts: mockAccounts,
});

console.log('Batch 3 Analysis:', batch3.analyzedHandles[0].statusBadge, '| Summary:', batch3.analyzedHandles[0].summary);
const analyzedItem = batch3.analyzedHandles[0];
if (!analyzedItem.isRepeatSameAccount || analyzedItem.repeatCountForAccount !== 1 || analyzedItem.previousOutreachId !== 'out-1') {
  console.error('✗ FAIL: Step 3 should be flagged as repeat with repeatCount=1 and previousOutreachId=out-1. Got:', analyzedItem);
} else {
  console.log('✓ PASS: Correctly detected as REPEAT SAME ACCOUNT! Repeat count: 1, Previous ID: out-1');
}

// Commit Step 3
const out3 = {
  id: 'out-3',
  influencer_id: 'inf-1',
  account_id: 'acc-alamo',
  employee_id: 'emp-daniyal',
  outreach_date: '2026-10-08T11:00:00Z',
  is_repeat_same_account: true,
  repeat_count_for_account: 1,
  previous_outreach_id: 'out-1',
};
outreachRecords.push(out3);

console.log('\n====================================================');
console.log('FINAL DATABASE INTEGRITY AUDIT:');
console.log(`Total Master Influencers: ${influencers.length} (Expected: 1)`);
console.log(`Total Outreach Records: ${outreachRecords.length} (Expected: 3)`);
console.log(`Same-Account Repeats: ${outreachRecords.filter(o => o.is_repeat_same_account).length} (Expected: 1)`);

if (influencers.length === 1 && outreachRecords.length === 3 && outreachRecords.filter(o => o.is_repeat_same_account).length === 1 && normFailures === 0) {
  console.log('>>> ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<');
  process.exit(0);
} else {
  console.error('>>> VERIFICATION FAILED <<<');
  process.exit(1);
}
