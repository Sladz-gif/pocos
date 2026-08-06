-- Check if poultry-images bucket has RLS enabled
SELECT bucket_id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'poultry-images';

-- Check storage RLS policies
SELECT policyname, tablename, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename LIKE 'storage%' OR tablename LIKE '%objects%';
