-- Supabase Storage RLS Policies for game-images bucket
-- NOTE: These SQL commands require superuser privileges and may not work
-- Use the Supabase Dashboard instead (see SUPABASE_SETUP.md)

-- If you have superuser access, you can run these commands:

-- 1. Allow public read access to all files
-- CREATE POLICY "Allow public read access" ON storage.objects
-- FOR SELECT USING (bucket_id = 'game-images');

-- 2. Allow public uploads
-- CREATE POLICY "Allow public uploads" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'game-images');

-- 3. Allow public deletions
-- CREATE POLICY "Allow public deletions" ON storage.objects
-- FOR DELETE USING (bucket_id = 'game-images');

-- RECOMMENDED: Use the Supabase Dashboard instead:
-- 1. Go to Storage → Policies
-- 2. Find your game-images bucket
-- 3. Either disable RLS OR create the policies manually
