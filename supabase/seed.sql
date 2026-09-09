-- ==============================================================================
-- THE TOX TECHNIQUE — SEED DATA SCRIPT
-- Demonstrates:
-- 1. Multiple marketing accounts & geographic locations
-- 2. Staff, Manager, and Admin roles with account assignments
-- 3. The Core Repeat Scenario:
--    Daniyal -> Alamo -> @example
--    Ahmed -> McKinney -> @example
--    Daniyal -> Alamo -> @example (REPEAT flagged)
-- 4. Cross-account duplicates (e.g. @notboredindc in Fairfax & Palm Beach)
-- 5. Historical records with NULL dates ("Historical / Date unavailable")
-- ==============================================================================

-- 1. Insert Locations
INSERT INTO public.locations (id, name, city, state, country, active) VALUES
('11111111-0000-0000-0000-000000000001', 'Alamo', 'Alamo', 'TX', 'USA', true),
('11111111-0000-0000-0000-000000000002', 'Fairfax', 'Fairfax', 'VA', 'USA', true),
('11111111-0000-0000-0000-000000000003', 'Denver', 'Denver', 'CO', 'USA', true),
('11111111-0000-0000-0000-000000000004', 'Southlake', 'Southlake', 'TX', 'USA', true),
('11111111-0000-0000-0000-000000000005', 'Riverton', 'Riverton', 'UT', 'USA', true),
('11111111-0000-0000-0000-000000000006', 'Scottsdale', 'Scottsdale', 'AZ', 'USA', true),
('11111111-0000-0000-0000-000000000007', 'Chandler', 'Chandler', 'AZ', 'USA', true),
('11111111-0000-0000-0000-000000000008', 'Palm Beach', 'Palm Beach', 'FL', 'USA', true),
('11111111-0000-0000-0000-000000000009', 'McKinney', 'McKinney', 'TX', 'USA', true),
('11111111-0000-0000-0000-000000000010', 'Sugar Land', 'Sugar Land', 'TX', 'USA', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Marketing Accounts
INSERT INTO public.marketing_accounts (id, account_name, instagram_handle, display_name, location_id, active) VALUES
('22222222-0000-0000-0000-000000000001', 'Alamo', 'thetoxalamo', 'The Tox Alamo', '11111111-0000-0000-0000-000000000001', true),
('22222222-0000-0000-0000-000000000002', 'Fairfax', 'thetoxfairfax', 'The Tox Fairfax', '11111111-0000-0000-0000-000000000002', true),
('22222222-0000-0000-0000-000000000003', 'Denver', 'thetoxdenver', 'The Tox Denver', '11111111-0000-0000-0000-000000000003', true),
('22222222-0000-0000-0000-000000000004', 'Southlake', 'thetoxsouthlake', 'The Tox Southlake', '11111111-0000-0000-0000-000000000004', true),
('22222222-0000-0000-0000-000000000005', 'Riverton', 'thetoxriverton', 'The Tox Riverton', '11111111-0000-0000-0000-000000000005', true),
('22222222-0000-0000-0000-000000000006', 'Scottsdale', 'thetoxscottsdale', 'The Tox Scottsdale', '11111111-0000-0000-0000-000000000006', true),
('22222222-0000-0000-0000-000000000007', 'Chandler', 'thetoxchandler', 'The Tox Chandler', '11111111-0000-0000-0000-000000000007', true),
('22222222-0000-0000-0000-000000000008', 'Palm Beach', 'thetoxpalmbeach', 'The Tox Palm Beach', '11111111-0000-0000-0000-000000000008', true),
('22222222-0000-0000-0000-000000000009', 'McKinney', 'thetoxmckinney', 'The Tox McKinney', '11111111-0000-0000-0000-000000000009', true),
('22222222-0000-0000-0000-000000000010', 'Sugarland', 'thetoxsugarland', 'The Tox Sugar Land', '11111111-0000-0000-0000-000000000010', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles / Staff Demo Users
-- (In live Supabase, auth.users records would exist. We insert dummy profile records for staging/local)
INSERT INTO public.profiles (id, email, full_name, role, active) VALUES
('33333333-0000-0000-0000-000000000001', 'daniyal@thetoxtechnique.com', 'Daniyal Khan', 'admin', true),
('33333333-0000-0000-0000-000000000002', 'ahmed@thetoxtechnique.com', 'Ahmed Malik', 'manager', true),
('33333333-0000-0000-0000-000000000003', 'sarah@thetoxtechnique.com', 'Sarah Jenkins', 'staff', true),
('33333333-0000-0000-0000-000000000004', 'elena@thetoxtechnique.com', 'Elena Rostova', 'staff', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Employee Account Assignments
INSERT INTO public.employee_account_assignments (employee_id, account_id) VALUES
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'), -- Daniyal -> Alamo
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002'), -- Daniyal -> Fairfax
('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000009'), -- Daniyal -> McKinney
('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001'), -- Ahmed -> Alamo
('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000009'), -- Ahmed -> McKinney
('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001'), -- Sarah -> Alamo
('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004'), -- Sarah -> Southlake
('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000003')  -- Elena -> Denver
ON CONFLICT DO NOTHING;

-- 5. Influencers: The Example Influencer & Sample Influencers
INSERT INTO public.influencers (id, instagram_handle, normalized_handle, instagram_url, display_name, follower_count, niche, city, state, primary_location_id) VALUES
('44444444-0000-0000-0000-000000000001', '@example', 'example', 'https://instagram.com/example', 'Jessica Jane Example', 45200, 'Wellness & Lifestyle', 'Alamo', 'TX', '11111111-0000-0000-0000-000000000001'),
('44444444-0000-0000-0000-000000000002', '@notboredindc', 'notboredindc', 'https://instagram.com/notboredindc', 'DC Explorer', 32100, 'City Lifestyle & Dining', 'Fairfax', 'VA', '11111111-0000-0000-0000-000000000002'),
('44444444-0000-0000-0000-000000000003', '@azfoodie', 'azfoodie', 'https://instagram.com/azfoodie', 'Arizona Foodie', 128000, 'Food & Drinks', 'Scottsdale', 'AZ', '11111111-0000-0000-0000-000000000006'),
('44444444-0000-0000-0000-000000000004', '@tastesoftheunion', 'tastesoftheunion', 'https://instagram.com/tastesoftheunion', 'Tastes of Union', 18400, 'Culinary & Beauty', 'Fairfax', 'VA', '11111111-0000-0000-0000-000000000002')
ON CONFLICT (normalized_handle) DO NOTHING;

-- 6. Core Repeat Scenario:
-- Outreach #1: Daniyal -> Alamo -> @example (Sept 1)
-- Outreach #2: Ahmed -> McKinney -> @example (Sept 3) [Cross-account legitimate!]
-- Outreach #3: Daniyal -> Alamo -> @example (Oct 8) [SAME ACCOUNT REPEAT!]
INSERT INTO public.outreach_records (id, influencer_id, account_id, employee_id, outreach_date, is_repeat_same_account, repeat_count_for_account, previous_outreach_id, status, notes, source) VALUES
('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '2026-09-01 14:30:00+00', false, 0, null, 'Contacted', 'Initial DM outreach for autumn wellness campaign', 'submission'),
('55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000002', '2026-09-03 16:15:00+00', false, 0, null, 'Contacted', 'Outreach from McKinney account for regional coverage', 'submission'),
('55555555-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '2026-10-08 11:00:00+00', true, 1, '55555555-0000-0000-0000-000000000001', 'Follow-up', 'Second outreach from Alamo (repeat detected)', 'submission')
ON CONFLICT (id) DO NOTHING;

-- Historical Import with NULL date (Historical import demo)
INSERT INTO public.outreach_records (id, influencer_id, account_id, employee_id, outreach_date, is_repeat_same_account, repeat_count_for_account, status, notes, source) VALUES
('55555555-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', null, null, false, 0, 'Contacted', 'Imported from legacy Sheet1.tsv', 'historical_import'),
('55555555-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000008', null, null, false, 0, 'Contacted', 'Imported from legacy Sheet1.tsv (Palm Beach column)', 'historical_import')
ON CONFLICT (id) DO NOTHING;
