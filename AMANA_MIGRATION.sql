-- AMANA MIGRATION SCRIPT
-- Migrates Pocos app to AmanA branding and removes ML/Jetson Nano features
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Date: 2026-10-02

-- ============================================================================
-- PART 1: REMOVE ML/JETSON NANO FEATURES
-- ============================================================================

-- 1. Drop Jetson-related functions
DROP FUNCTION IF EXISTS link_coop_device(TEXT, TEXT);
DROP FUNCTION IF EXISTS request_test_snapshot(TEXT);

-- 2. Drop Jetson-related tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS device_test_snapshots CASCADE;
DROP TABLE IF EXISTS bird_detections CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- 3. Remove device_address columns from profiles and bird_cages
-- These were used to link coops to Jetson devices
ALTER TABLE profiles DROP COLUMN IF EXISTS device_address;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bird_cages') THEN
    ALTER TABLE bird_cages DROP COLUMN IF EXISTS device_address;
  END IF;
END $$;

-- 4. Drop indexes related to Jetson features
DROP INDEX IF EXISTS idx_assets_owner;
DROP INDEX IF EXISTS idx_bird_detections_asset;
DROP INDEX IF EXISTS idx_bird_detections_detected_at;
DROP INDEX IF EXISTS idx_device_test_snapshots_asset;
DROP INDEX IF EXISTS idx_test_snapshots_asset;
DROP INDEX IF EXISTS idx_test_snapshots_captured_at;
DROP INDEX IF EXISTS idx_profiles_device_address;

-- 5. Remove realtime subscriptions for Jetson tables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Check and drop assets if in publication
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'assets') THEN
      ALTER PUBLICATION supabase_realtime DROP TABLE assets;
    END IF;
    
    -- Check and drop bird_detections if in publication
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bird_detections') THEN
      ALTER PUBLICATION supabase_realtime DROP TABLE bird_detections;
    END IF;
    
    -- Check and drop device_test_snapshots if in publication
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'device_test_snapshots') THEN
      ALTER PUBLICATION supabase_realtime DROP TABLE device_test_snapshots;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 2: UPDATE APP BRANDING TO AMANA
-- ============================================================================

-- 6. Update storage bucket name (rename from pocos-images to amana-images)
-- Note: Storage buckets cannot be renamed directly, so we create a new one
INSERT INTO storage.buckets (id, name, public)
VALUES ('amana-images', 'amana-images', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies for new bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'amana-images');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload') THEN
    CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'amana-images');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Update') THEN
    CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'amana-images');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Delete') THEN
    CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'amana-images');
  END IF;
END $$;

-- Optionally: Drop old bucket (uncomment if you want to remove the old bucket)
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Update" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'pocos-images';

-- 7. Update ranch names that still reference "Pocos"
UPDATE ranch 
SET name = REPLACE(name, 'Pocos', 'AmanA'),
    updated_at = NOW()
WHERE name LIKE '%Pocos%';

-- 8. Update ranch codes that reference "Pocos"
UPDATE ranch 
SET code = REPLACE(code, 'POCOS', 'AMANA'),
    updated_at = NOW()
WHERE code LIKE '%POCOS%';

-- ============================================================================
-- PART 3: CLEANUP AND VALIDATION
-- ============================================================================

-- 9. Verify tables no longer exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assets') THEN
    RAISE NOTICE 'WARNING: assets table still exists - manual cleanup may be needed';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bird_detections') THEN
    RAISE NOTICE 'WARNING: bird_detections table still exists - manual cleanup may be needed';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_test_snapshots') THEN
    RAISE NOTICE 'WARNING: device_test_snapshots table still exists - manual cleanup may be needed';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'App branding updated to AmanA';
  RAISE NOTICE 'ML/Jetson Nano features removed';
END $$;

-- ============================================================================
-- PART 4: OPTIONAL - DATA MIGRATION (Storage URLs)
-- ============================================================================

-- If you have existing images in the old bucket and want to update references:
-- Uncomment and run this section if needed

-- UPDATE animals SET image_url = REPLACE(image_url, 'pocos-images', 'amana-images') WHERE image_url LIKE '%pocos-images%';
-- UPDATE store_listings SET image_url = REPLACE(image_url, 'pocos-images', 'amana-images') WHERE image_url LIKE '%pocos-images%';
-- UPDATE ranch SET logo_url = REPLACE(logo_url, 'pocos-images', 'amana-images') WHERE logo_url LIKE '%pocos-images%';
-- UPDATE ranch SET cover_url = REPLACE(cover_url, 'pocos-images', 'amana-images') WHERE cover_url LIKE '%pocos-images%';
-- UPDATE ranch_users SET avatar_url = REPLACE(avatar_url, 'pocos-images', 'amana-images') WHERE avatar_url LIKE '%pocos-images%';
-- UPDATE chat_messages SET image_url = REPLACE(image_url, 'pocos-images', 'amana-images') WHERE image_url LIKE '%pocos-images%';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
