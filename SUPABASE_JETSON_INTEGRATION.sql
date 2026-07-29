
-- POCOS Jetson Nano Integration Migration
-- Adds tables and functions for poultry counting device management
-- Also adds missing columns if tables already exist

-- 1. Create assets table (if not exists), or add missing columns
CREATE TABLE IF NOT EXISTS assets (
  asset_id TEXT PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  last_seen_at TIMESTAMP WITH TIME ZONE,
  pending_test_snapshot BOOLEAN DEFAULT FALSE,
  unsynced_detections INTEGER DEFAULT 0,
  unsynced_daily_counts INTEGER DEFAULT 0,
  pending_images_on_disk INTEGER DEFAULT 0,
  device_secret_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to assets if they don't exist
DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS pending_test_snapshot BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS unsynced_detections INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS unsynced_daily_counts INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS pending_images_on_disk INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS device_secret_hash TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;


-- 2. Add device_address to coops/profiles (we'll add to both profiles and bird_cages if they exist)
-- First, add to profiles table (for bird profiles/coops)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS device_address TEXT REFERENCES assets(asset_id);

-- Add to bird_cages if that table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bird_cages') THEN
    ALTER TABLE bird_cages 
      ADD COLUMN IF NOT EXISTS device_address TEXT REFERENCES assets(asset_id);
  END IF;
END $$;


-- 3. Create bird_detections table (if not exists), or add missing columns
CREATE TABLE IF NOT EXISTS bird_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT REFERENCES assets(asset_id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  confidence NUMERIC(5,2),
  track_id TEXT,
  count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to bird_detections if they don't exist
DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS asset_id TEXT REFERENCES assets(asset_id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS image_url TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS confidence NUMERIC(5,2);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS track_id TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS count INTEGER;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bird_detections ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;


-- 4. Create device_test_snapshots table (if not exists), or add missing columns
CREATE TABLE IF NOT EXISTS device_test_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT REFERENCES assets(asset_id) ON DELETE CASCADE,
  image_url TEXT,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cpu_temp_c NUMERIC(4,1),
  uptime_seconds BIGINT,
  fps NUMERIC(5,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to device_test_snapshots if they don't exist
DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS asset_id TEXT REFERENCES assets(asset_id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS image_url TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS cpu_temp_c NUMERIC(4,1);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS uptime_seconds BIGINT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS fps NUMERIC(5,1);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE device_test_snapshots ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;


-- 5. Enable RLS on all new tables (safe to run even if already enabled)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bird_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_test_snapshots ENABLE ROW LEVEL SECURITY;


-- 6. Create RLS policies (use CREATE POLICY IF NOT EXISTS if available, else check if policy exists first)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can view their own assets') THEN
    CREATE POLICY "Users can view their own assets" 
      ON assets FOR SELECT 
      USING (auth.uid() = owner_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can update their own assets') THEN
    CREATE POLICY "Users can update their own assets" 
      ON assets FOR UPDATE 
      USING (auth.uid() = owner_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bird_detections' AND policyname = 'Users can view their own bird detections') THEN
    CREATE POLICY "Users can view their own bird detections" 
      ON bird_detections FOR SELECT 
      USING (EXISTS (SELECT 1 FROM assets WHERE assets.asset_id = bird_detections.asset_id AND assets.owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'device_test_snapshots' AND policyname = 'Users can view their own test snapshots') THEN
    CREATE POLICY "Users can view their own test snapshots" 
      ON device_test_snapshots FOR SELECT 
      USING (EXISTS (SELECT 1 FROM assets WHERE assets.asset_id = device_test_snapshots.asset_id AND assets.owner_user_id = auth.uid()));
  END IF;
END $$;


-- 7. Create link_coop_device RPC function
CREATE OR REPLACE FUNCTION link_coop_device(p_coop_id TEXT, p_device_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
  v_asset_owner UUID;
BEGIN
  -- Get current user's ID
  v_owner_id := auth.uid();
  IF v_owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify the coop belongs to the current user (check both profiles and bird_cages)
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_coop_id AND ranch_id IN (SELECT id FROM ranches WHERE owner_user_id = v_owner_id)) THEN
    -- Check asset's owner (use lowercase for hex format)
    SELECT owner_user_id INTO v_asset_owner FROM assets WHERE asset_id = LOWER(p_device_address);
    
    -- If asset is unclaimed or already belongs to user
    IF v_asset_owner IS NULL OR v_asset_owner = v_owner_id THEN
      -- Update asset's owner
      UPDATE assets 
      SET owner_user_id = v_owner_id, updated_at = NOW()
      WHERE asset_id = LOWER(p_device_address);
      
      -- Update coop's device address
      UPDATE profiles 
      SET device_address = LOWER(p_device_address), updated_at = NOW()
      WHERE id = p_coop_id;
      
      RETURN TRUE;
    ELSE
      -- Asset belongs to someone else
      RETURN FALSE;
    END IF;
  END IF;

  -- Check bird_cages table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bird_cages') THEN
    IF EXISTS (SELECT 1 FROM bird_cages WHERE id = p_coop_id AND ranch_id IN (SELECT id FROM ranches WHERE owner_user_id = v_owner_id)) THEN
      SELECT owner_user_id INTO v_asset_owner FROM assets WHERE asset_id = LOWER(p_device_address);
      
      IF v_asset_owner IS NULL OR v_asset_owner = v_owner_id THEN
        UPDATE assets 
        SET owner_user_id = v_owner_id, updated_at = NOW()
        WHERE asset_id = LOWER(p_device_address);
        
        UPDATE bird_cages 
        SET device_address = LOWER(p_device_address), updated_at = NOW()
        WHERE id = p_coop_id;
        
        RETURN TRUE;
      ELSE
        RETURN FALSE;
      END IF;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$;


-- 8. Create request_test_snapshot RPC function
CREATE OR REPLACE FUNCTION request_test_snapshot(p_asset_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  v_owner_id := auth.uid();
  IF v_owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify the asset belongs to current user (use lowercase for hex format)
  IF EXISTS (SELECT 1 FROM assets WHERE asset_id = LOWER(p_asset_id) AND owner_user_id = v_owner_id) THEN
    UPDATE assets 
    SET pending_test_snapshot = TRUE, updated_at = NOW()
    WHERE asset_id = LOWER(p_asset_id);
    
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


-- 9. Add indexes for performance (use IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_bird_detections_asset ON bird_detections(asset_id);
CREATE INDEX IF NOT EXISTS idx_device_test_snapshots_asset ON device_test_snapshots(asset_id);


-- 10. Add migration to ensure device addresses are lowercase and asset exists
-- This ensures the Jetson device with hex address format works correctly
DO $$
BEGIN
  -- Update any existing uppercase device addresses to lowercase
  UPDATE assets 
  SET asset_id = LOWER(asset_id), updated_at = NOW()
  WHERE asset_id != LOWER(asset_id);
  
  UPDATE profiles 
  SET device_address = LOWER(device_address), updated_at = NOW()
  WHERE device_address != LOWER(device_address);
  
  UPDATE bird_cages 
  SET device_address = LOWER(device_address), updated_at = NOW()
  WHERE device_address != LOWER(device_address);
END $$;


-- 11. Create the test asset if it doesn't exist (for the Jetson device)
-- This is for the specific device: 989347d6c29e5e8b
INSERT INTO assets (asset_id, owner_user_id, status, created_at, updated_at)
VALUES ('989347d6c29e5e8b', NULL, 'active', NOW(), NOW())
ON CONFLICT (asset_id) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_bird_detections_detected_at ON bird_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_snapshots_asset ON device_test_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_test_snapshots_captured_at ON device_test_snapshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_device_address ON profiles(device_address);


-- 10. Add these tables to realtime publication if needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'assets') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE assets;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bird_detections') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE bird_detections;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'device_test_snapshots') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE device_test_snapshots;
    END IF;
  END IF;
END $$;
