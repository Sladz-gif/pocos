-- Link the Jetson device to a coop/profile
-- Replace YOUR_PROFILE_ID with an actual profile ID from your database

-- First, let's check what profiles exist
SELECT id, name, device_address FROM profiles LIMIT 10;

-- Then link the Jetson device to a profile (uncomment and replace YOUR_PROFILE_ID)
-- UPDATE profiles 
-- SET device_address = '989347d6c29e5e8b', updated_at = NOW()
-- WHERE id = 'YOUR_PROFILE_ID';

-- Also assign ownership of the asset to the profile's owner
-- UPDATE assets 
-- SET owner_user_id = (SELECT ranch_id FROM profiles WHERE id = 'YOUR_PROFILE_ID' LIMIT 1), updated_at = NOW()
-- WHERE asset_id = '989347d6c29e5e8b';
