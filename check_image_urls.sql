-- Check actual image URLs from bird detections
SELECT id, asset_id, detected_at, image_url 
FROM bird_detections 
WHERE asset_id = '989347d6c29e5e8b' 
  AND image_url IS NOT NULL
ORDER BY detected_at DESC 
LIMIT 5;
