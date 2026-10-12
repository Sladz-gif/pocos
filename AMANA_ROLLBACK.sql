-- AMANA ROLLBACK SCRIPT
-- Reverts AmanA branding changes back to Pocos (if needed)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- WARNING: This will restore Jetson Nano features - only run if absolutely necessary

-- ============================================================================
-- PART 1: RESTORE JETSON NANO FEATURES
-- ============================================================================

-- 1. Recreate assets table
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

-- 2. Recreate bird_detections table
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

-- 3. Recreate device_test_snapshots table
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

-- 4. Restore device_address columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS device_address TEXT REFERENCES assets(asset_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bird_cages') THEN
    ALTER TABLE bird_cages ADD COLUMN IF NOT EXISTS device_address TEXT REFERENCES assets(asset_id);
  END IF;
END $$;

-- 5. Restore indexes
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_bird_detections_asset ON bird_detections(asset_id);
CREATE INDEX IF NOT EXISTS idx_bird_detections_detected_at ON bird_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_test_snapshots_asset ON device_test_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_test_snapshots_asset ON device_test_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_test_snapshots_captured_at ON device_test_snapshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_device_address ON profiles(device_address);

-- 6. Restore RLS policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bird_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_test_snapshots ENABLE ROW LEVEL SECURITY;

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

-- 7. Restore functions
CREATE OR REPLACE FUNCTION link_coop_device(p_coop_id TEXT, p_device_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
  v_asset_owner UUID;
BEGIN
  v_owner_id := auth.uid();
  IF v_owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_coop_id AND ranch_id IN (SELECT id FROM ranches WHERE owner_user_id = v_owner_id)) THEN
    SELECT owner_user_id INTO v_asset_owner FROM assets WHERE asset_id = LOWER(p_device_address);
    
    IF v_asset_owner IS NULL OR v_asset_owner = v_owner_id THEN
      UPDATE assets 
      SET owner_user_id = v_owner_id, updated_at = NOW()
      WHERE asset_id = LOWER(p_device_address);
      
      UPDATE profiles 
      SET device_address = LOWER(p_device_address), updated_at = NOW()
      WHERE id = p_coop_id;
      
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;

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

  IF EXISTS (SELECT 1 FROM assets WHERE asset_id = LOWER(p_asset_id) AND owner_user_id = v_owner_id) THEN
    UPDATE assets 
    SET pending_test_snapshot = TRUE, updated_at = NOW()
    WHERE asset_id = LOWER(p_asset_id);
    
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- 8. Restore realtime subscriptions
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

-- ============================================================================
-- PART 2: REVERT BRANDING TO POCOS
-- ============================================================================

-- 9. Revert ranch names
UPDATE ranch 
SET name = REPLACE(name, 'AmanA', 'Pocos'),
    updated_at = NOW()
WHERE name LIKE '%AmanA%';

-- 10. Revert ranch codes
UPDATE ranch 
SET code = REPLACE(code, 'AMANA', 'POCOS'),
    updated_at = NOW()
WHERE code LIKE '%AMANA%';

-- ============================================================================
-- PART 3: STORAGE BUCKET (Manual Intervention Required)
-- ============================================================================

-- Note: You'll need to manually:
-- 1. Copy data from amana-images back to pocos-images if needed
-- 2. Update the bucket reference in the app config
-- 3. Drop the amana-images bucket if no longer needed

-- ============================================================================
-- END OF ROLLBACK
-- ============================================================================
