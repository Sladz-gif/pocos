-- Check if poultry-images bucket is public
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'poultry-images';
