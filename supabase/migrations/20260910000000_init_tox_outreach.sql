-- ==============================================================================
-- THE TOX TECHNIQUE — INFLUENCER OUTREACH & DATABASE PLATFORM
-- Schema Migration: 20260910000000_init_tox_outreach.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Profiles / Employees Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Marketing Accounts Table
CREATE TABLE IF NOT EXISTS public.marketing_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name TEXT NOT NULL,
    instagram_handle TEXT NOT NULL,
    display_name TEXT,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Employee Account Assignments (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.employee_account_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT unique_employee_account UNIQUE(employee_id, account_id)
);

-- 5. Influencers Table (Master Canonical Influencer Entity)
CREATE TABLE IF NOT EXISTS public.influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instagram_handle TEXT NOT NULL,
    normalized_handle TEXT NOT NULL UNIQUE,
    instagram_url TEXT,
    display_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    primary_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    niche TEXT,
    gender TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    profile_status TEXT NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Influencer Location Tags (Multi-location relationships)
CREATE TABLE IF NOT EXISTS public.influencer_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_influencer_location UNIQUE(influencer_id, location_id)
);

-- 7. Import Batches Table (Tracks TSV/CSV Migration Files)
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_rows INTEGER DEFAULT 0,
    recognized_handles INTEGER DEFAULT 0,
    new_influencers_count INTEGER DEFAULT 0,
    repeat_outreach_count INTEGER DEFAULT 0,
    ambiguous_rows_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. Outreach Records Table (Historical Events connecting Employee -> Account -> Influencer)
CREATE TABLE IF NOT EXISTS public.outreach_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    outreach_date TIMESTAMPTZ, -- Nullable for legacy imported records!
    is_repeat_same_account BOOLEAN NOT NULL DEFAULT false,
    previous_outreach_id UUID REFERENCES public.outreach_records(id) ON DELETE SET NULL,
    repeat_count_for_account INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Contacted' CHECK (status IN ('Submitted', 'Contacted', 'Follow-up', 'Replied', 'Interested', 'Not Interested', 'No Response', 'Closed', 'Other')),
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'submission',
    import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Import Rows Table (Detailed row staging for review)
CREATE TABLE IF NOT EXISTS public.import_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
    row_index INTEGER NOT NULL,
    raw_data JSONB,
    detected_handle TEXT,
    detected_account_or_location TEXT,
    detected_context TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'ambiguous', 'error', 'processed')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Audit Logs Table (Administrative audit trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Application Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name TEXT NOT NULL DEFAULT 'The Tox Technique',
    default_timezone TEXT NOT NULL DEFAULT 'America/Chicago',
    pagination_limit INTEGER NOT NULL DEFAULT 25,
    repeat_warning_enabled BOOLEAN NOT NULL DEFAULT true,
    meta_api_configured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_influencers_normalized_handle ON public.influencers(normalized_handle);
CREATE INDEX IF NOT EXISTS idx_influencers_display_name ON public.influencers(display_name);
CREATE INDEX IF NOT EXISTS idx_influencers_primary_loc ON public.influencers(primary_location_id);

CREATE INDEX IF NOT EXISTS idx_outreach_influencer_id ON public.outreach_records(influencer_id);
CREATE INDEX IF NOT EXISTS idx_outreach_account_id ON public.outreach_records(account_id);
CREATE INDEX IF NOT EXISTS idx_outreach_employee_id ON public.outreach_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_outreach_date ON public.outreach_records(outreach_date);
CREATE INDEX IF NOT EXISTS idx_outreach_submitted_at ON public.outreach_records(submitted_at);
CREATE INDEX IF NOT EXISTS idx_outreach_is_repeat ON public.outreach_records(is_repeat_same_account);
CREATE INDEX IF NOT EXISTS idx_outreach_account_influencer ON public.outreach_records(account_id, influencer_id);

CREATE INDEX IF NOT EXISTS idx_assignments_employee ON public.employee_account_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_account ON public.employee_account_assignments(account_id);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_locations_modtime BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_marketing_accounts_modtime BEFORE UPDATE ON public.marketing_accounts FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_influencers_modtime BEFORE UPDATE ON public.influencers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_app_settings_modtime BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_account_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper to retrieve caller's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Profiles: Authenticated users can view; Admins can update any; users can update own name/avatar
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL TO authenticated USING (current_user_role() = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

-- Locations & Accounts: Viewable by authenticated; Editable by Admin & Manager
CREATE POLICY "Locations viewable by authenticated" ON public.locations
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locations manageable by admin and manager" ON public.locations
    FOR ALL TO authenticated USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Accounts viewable by authenticated" ON public.marketing_accounts
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Accounts manageable by admin and manager" ON public.marketing_accounts
    FOR ALL TO authenticated USING (current_user_role() IN ('admin', 'manager'));

-- Assignments: Viewable by authenticated; Manageable by admin & manager
CREATE POLICY "Assignments viewable by authenticated" ON public.employee_account_assignments
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assignments manageable by admin and manager" ON public.employee_account_assignments
    FOR ALL TO authenticated USING (current_user_role() IN ('admin', 'manager'));

-- Influencers: Viewable by all authenticated; insert/update by authenticated
CREATE POLICY "Influencers viewable by authenticated" ON public.influencers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Influencers manageable by authenticated" ON public.influencers
    FOR ALL TO authenticated USING (true);

-- Outreach Records: Viewable by all authenticated (or filtered for staff); insertable by authenticated
CREATE POLICY "Outreach viewable by authenticated" ON public.outreach_records
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Outreach insertable by authenticated" ON public.outreach_records
    FOR INSERT TO authenticated WITH CHECK (
        current_user_role() IN ('admin', 'manager') OR
        EXISTS (
            SELECT 1 FROM public.employee_account_assignments
            WHERE employee_id = auth.uid() AND account_id = outreach_records.account_id
        )
    );
CREATE POLICY "Outreach updatable by admin/manager or creator" ON public.outreach_records
    FOR UPDATE TO authenticated USING (
        current_user_role() IN ('admin', 'manager') OR employee_id = auth.uid()
    );

-- Audit Logs: Viewable by admin and manager
CREATE POLICY "Audit logs viewable by admin/manager" ON public.audit_logs
    FOR SELECT TO authenticated USING (current_user_role() IN ('admin', 'manager'));
CREATE POLICY "Audit logs insertable by system" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Settings: Viewable by all authenticated; editable by admin
CREATE POLICY "Settings viewable by authenticated" ON public.app_settings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Settings manageable by admin" ON public.app_settings
    FOR ALL TO authenticated USING (current_user_role() = 'admin');
