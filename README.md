# The Tox Technique — Influencer Outreach & Database Platform

A production-quality internal web application for **The Tox Technique**, designed for marketing staff conducting multi-account Instagram outreach, managers overseeing team performance, and administrators configuring accounts, locations, and data migrations.

---

## Core Business & Architectural Principles

### 1. The Core Data Principle
- **One Influencer** = One canonical record in the master `influencers` database, identified and indexed by `normalized_handle`.
- **Every Outreach** = A distinct historical event connecting `Employee → Marketing Account → Influencer → Date → Status`.
- **Cross-Account Activity** = Legitimate multi-account marketing touchpoints (e.g. contacting the same influencer from Alamo, Southlake, or McKinney). This is **not** a duplicate error and is tracked chronologically.
- **Same-Account Repeat** = Repeatedly reaching the same influencer from the *same* Instagram account. The engine automatically detects this, sets `is_repeat_same_account = true`, tracks `repeat_count_for_account`, links `previous_outreach_id`, and surfaces it in pre-submission previews without silently blocking.
- **Historical Data Integrity** = Legacy records from historical sheets (such as `influencer track - Sheet1.tsv`) have `NULL` outreach dates and are clearly labeled as **"Historical / Date unavailable"** rather than inventing fake dates.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript / JSX (Strictly no TypeScript / TSX per specification)
- **Database & Auth**: Supabase PostgreSQL, Row Level Security (RLS) policies, and Auth profiles
- **Styling**: Tailwind CSS (Restrained, dark operational theme; high-density tables; subtle zinc borders)
- **Icons**: Lucide React
- **Parsers & Utilities**: PapaParse (TSV/CSV parsing), date-fns & date-fns-tz (organization timezone support)

---

## System Navigation & Roles

The system implements 3 distinct authorization tiers:

| Tier | Role | Capabilities |
| :--- | :--- | :--- |
| **1** | **Admin** | Full system access: manage users, edit roles, configure marketing accounts, locations, database imports, audit logs, and settings. |
| **2** | **Manager** | Oversight access: view team-level analytics, manage staff account assignments, review outreach history, import historical data, and audit data quality. |
| **3** | **Staff** | Operational speed: access only assigned marketing accounts (~10 accounts per employee), fast bulk outreach submission, pre-submission repeat previews, and global influencer search. |

---

## Database Schema & Migrations

The complete PostgreSQL migration script is located at:
[`supabase/migrations/20260910000000_init_tox_outreach.sql`](file:///Users/mac/Desktop/toxbody/supabase/migrations/20260910000000_init_tox_outreach.sql)

### Core Tables
1. `profiles`: System employees linked to Supabase `auth.users(id)`. Stores `full_name`, `email`, `role`, `active`, and timestamps.
2. `locations`: Operating geographic markets (e.g. Alamo, Fairfax, Denver, Southlake, Riverton, Scottsdale, Chandler, Palm Beach, McKinney, Sugar Land).
3. `marketing_accounts`: Unique Instagram marketing accounts (e.g. `@thetoxalamo`, `@thetoxfairfax`) with foreign key links to `locations`.
4. `employee_account_assignments`: Many-to-many junction connecting employees to permitted marketing accounts.
5. `influencers`: Master canonical influencers directory. Stores `normalized_handle` (**UNIQUE INDEX**), display formatting `@handle`, Instagram URL, follower count, niche, and verification status.
6. `outreach_records`: Historical touchpoints. Fields: `influencer_id`, `account_id`, `employee_id`, `outreach_date` (nullable for legacy), `is_repeat_same_account`, `previous_outreach_id`, `repeat_count_for_account`, `status`, and `notes`.
7. `import_batches` & `import_rows`: Records of uploaded TSV/CSV files and parsing resolution logs.
8. `audit_logs`: Administrative log tracking account modifications, role updates, and bulk data commits.
9. `app_settings`: Organization parameters, default timezone (`America/Chicago`), and Meta API status.

### Running Migrations in Supabase
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste and run [`supabase/migrations/20260910000000_init_tox_outreach.sql`](file:///Users/mac/Desktop/toxbody/supabase/migrations/20260910000000_init_tox_outreach.sql).
3. Paste and run [`supabase/seed.sql`](file:///Users/mac/Desktop/toxbody/supabase/seed.sql) to seed default accounts, locations, staff, and core repeat scenarios.

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Organization Settings
NEXT_PUBLIC_ORG_NAME="The Tox Technique"
NEXT_PUBLIC_DEFAULT_TIMEZONE="America/Chicago"

# Meta / Instagram Graph API (Optional External Verification)
META_APP_ID=
META_APP_SECRET=
INSTAGRAM_GRAPH_ACCESS_TOKEN=
```

> [!NOTE]
> If Supabase credentials are not provided initially, the platform includes a local fallback data layer with pre-seeded test data, allowing immediate testing of all features out-of-the-box.

---

## How to Create the First Admin

1. Sign up a user in Supabase Auth (or run the app and use the role switcher).
2. In Supabase SQL Editor, execute:
```sql
INSERT INTO public.profiles (id, email, full_name, role, active)
VALUES ('YOUR_USER_UUID', 'admin@thetoxtechnique.com', 'Admin User', 'admin', true)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## How to Import Historical Data (`influencer track - Sheet1.tsv`)

1. In the sidebar, navigate to **TSV / CSV Imports** (`/imports`).
2. You can either:
   - Click **"Load 'influencer track - Sheet1.tsv'"** to immediately test the bundled sample data.
   - Or drag and drop any TSV/CSV spreadsheet.
3. The normalizer will:
   - Identify header accounts (Fairfax, Palm Beach, Denver).
   - Detect embedded mid-column account shifts (e.g. Southlake, Riverton, Alamo, Scottsdale, Chandler).
   - Resolve duplicate handles appearing across columns (e.g. `@notboredindc`, `@azfoodie`).
   - Flag any ambiguous cells for administrative resolution.
4. Review the staged statistics and click **"Commit Historical Migration"**.

---

## Verification & Automated Tests

Run the built-in logic and parser verification test suites:

```bash
# 1. Verify Handle Normalization & Core Repeat Scenario Logic
node scripts/test-repeat-logic.mjs

# 2. Verify Messy TSV Parser against `influencer_track_sample.txt`
node scripts/test-tsv-parser.mjs

# 3. Production Build
npm run build
```

---

## Deployment to Vercel

1. Push your repository to GitHub or GitLab:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of The Tox Technique Outreach Platform"
   ```
2. In Vercel, click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ORG_NAME`
   - `NEXT_PUBLIC_DEFAULT_TIMEZONE`
4. Deploy! Next.js App Router runs smoothly on Vercel with zero extra server configuration.
