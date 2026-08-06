-- Check Jetson device status
SELECT asset_id, owner_user_id, last_seen_at, status, created_at, updated_at 
FROM assets 
WHERE asset_id = '989347d6c29e5e8b';

-- Check bird detections for Jetson
SELECT id, asset_id, detected_at, image_url, count, interval_count 
FROM bird_detections 
WHERE asset_id = '989347d6c29e5e8b' 
ORDER BY detected_at DESC 
LIMIT 10;
