-- Database State Verification Script
-- Run this to check the current state after running migration/rollback scripts

-- 1. Check if Jetson tables exist (should NOT exist if migration was successful)
SELECT 'Jetson Tables Check' as check_type,
       tablename,
       CASE 
         WHEN tablename IN ('assets', 'bird_detections', 'device_test_snapshots') THEN 'EXISTS (should not exist if AmanA migration is active)'
         ELSE 'Other table'
       END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assets', 'bird_detections', 'device_test_snapshots');

-- 2. Check if device_address columns exist (should NOT exist if migration was successful)
SELECT 'Device Address Columns Check' as check_type,
       table_name,
       column_name,
       'EXISTS (should not exist if AmanA migration is active)' as status
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'bird_cages')
AND column_name = 'device_address';

-- 3. Check storage buckets
SELECT 'Storage Buckets' as check_type,
       id,
       name,
       public
FROM storage.buckets
WHERE id IN ('pocos-images', 'amana-images');

-- 4. Check ranch names for branding
SELECT 'Ranch Names Check' as check_type,
       name,
       CASE 
         WHEN name LIKE '%Pocos%' THEN 'Still using Pocos branding'
         WHEN name LIKE '%AmanA%' THEN 'Using AmanA branding'
         ELSE 'No clear branding'
       END as status
FROM ranch;

-- 5. Check ranch codes
SELECT 'Ranch Codes Check' as check_type,
       code,
       CASE 
         WHEN code LIKE '%POCOS%' THEN 'Still using Pocos code'
         WHEN code LIKE '%AMANA%' THEN 'Using AmanA code'
         ELSE 'No clear code pattern'
       END as status
FROM ranch;

-- 6. Check if Jetson functions exist
SELECT 'Functions Check' as check_type,
       routine_name,
       'EXISTS (should not exist if AmanA migration is active)' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('link_coop_device', 'request_test_snapshot');

-- 7. Summary
SELECT 'Summary' as check_type,
       COUNT(*) as total_jetson_tables
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assets', 'bird_detections', 'device_test_snapshots');
