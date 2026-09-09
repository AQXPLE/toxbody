-- Allow anon role read access for public dashboard browsing
CREATE POLICY "Locations viewable by anon" ON public.locations FOR SELECT TO anon USING (true);
CREATE POLICY "Accounts viewable by anon" ON public.marketing_accounts FOR SELECT TO anon USING (true);
CREATE POLICY "Influencers viewable by anon" ON public.influencers FOR SELECT TO anon USING (true);
CREATE POLICY "Outreach viewable by anon" ON public.outreach_records FOR SELECT TO anon USING (true);
CREATE POLICY "Profiles viewable by anon" ON public.profiles FOR SELECT TO anon USING (true);
