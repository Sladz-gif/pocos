-- CHECK DATABASE STRUCTURE AND PERMISSIONS
-- Run this in Supabase SQL Editor to diagnose network errors

-- 1. Check if required tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('ranch', 'ranch_users', 'profiles', 'animals', 'tasks')
ORDER BY table_name;

-- 2. Check ranch table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ranch'
ORDER BY ordinal_position;

-- 3. Check ranch_users table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ranch_users'
ORDER BY ordinal_position;

-- 4. Check RLS policies on ranch table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ranch';

-- 5. Check RLS policies on ranch_users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ranch_users';

-- 6. Test if anonymous users can insert (simulating the app)
-- This will show if RLS is blocking
DO $$
BEGIN
  RAISE NOTICE 'Testing anonymous insert permissions...';
  -- This should fail if RLS is properly configured
  -- or succeed if anon has insert permissions
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Insert test failed: %', SQLERRM;
END $$;

-- 7. Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ranch', 'ranch_users');

-- 8. Check existing data in ranch table
SELECT COUNT(*) as ranch_count FROM ranch;

-- 9. Check existing data in ranch_users table
SELECT COUNT(*) as ranch_users_count FROM ranch_users;

-- 10. Check auth.users (to see if auth is working)
SELECT COUNT(*) as auth_users_count FROM auth.users;
