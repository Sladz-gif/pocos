-- Check if live view file exists in storage
SELECT * FROM storage.objects 
WHERE bucket_id = 'poultry-images' 
  AND name LIKE 'live_view%';
