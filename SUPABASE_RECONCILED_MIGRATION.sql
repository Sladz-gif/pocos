-- POCOS Reconciled Supabase Migration - June 12, 2026
-- Adds only missing tables/columns, avoiding conflicts with your existing setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. ADD MISSING COLUMNS TO EXISTING TABLES (if not already present)

-- Animals Table: Add missing columns (safe if already added)
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS internal_code TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- Update Animals health_status check constraint (if not already updated)
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (SELECT FROM pg_constraint WHERE conname = 'animals_health_status_check') THEN
    ALTER TABLE animals DROP CONSTRAINT animals_health_status_check;
  END IF;
  
  -- Add updated constraint
  ALTER TABLE animals ADD CONSTRAINT animals_health_status_check CHECK (
    health_status IN ('healthy', 'sick', 'recovering', 'quarantined', 'quarantine', 'deceased', 'pregnant', 'lactating', 'dry')
  );
END $$;

-- Tasks Table: Ensure attachments and tags exist (text array for compatibility with your code)
DO $$
BEGIN
  -- Check and update attachments column (if JSONB, convert to TEXT[])
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'attachments' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN attachments DROP DEFAULT;
    ALTER TABLE tasks ALTER COLUMN attachments TYPE TEXT[] USING ARRAY[]::TEXT[];
    ALTER TABLE tasks ALTER COLUMN attachments SET DEFAULT '{}';
  END IF;

  -- Check and add attachments if not present
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'attachments') THEN
    ALTER TABLE tasks ADD COLUMN attachments TEXT[] DEFAULT '{}';
  END IF;

  -- Check and update tags column (if JSONB, convert to TEXT[])
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'tags' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN tags DROP DEFAULT;
    ALTER TABLE tasks ALTER COLUMN tags TYPE TEXT[] USING ARRAY[]::TEXT[];
    ALTER TABLE tasks ALTER COLUMN tags SET DEFAULT '{}';
  END IF;

  -- Check and add tags if not present
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
    ALTER TABLE tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 2. ENSURE EXISTING TABLES ARE IN REALTIME (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bird_cages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bird_cages;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'poultry_live_status') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE poultry_live_status;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bird_counts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bird_counts;
  END IF;
END $$;
