-- Check the profiles table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';

-- Check if there's an owner_user_id column in profiles
SELECT id, name, owner_user_id FROM profiles LIMIT 5;
