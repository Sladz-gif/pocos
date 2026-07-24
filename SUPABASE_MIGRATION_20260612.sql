-- POCOS Supabase Database Migration - June 12, 2026
-- Adds Poultry Profiles, Bird Count Records, and updates existing tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. CREATE NEW TABLES

-- Poultry Profiles: Groups birds (e.g., Broilers, Layers) for easier management
CREATE TABLE IF NOT EXISTS poultry_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL, -- e.g., "bird", "chicken", etc.
  custom_fields JSONB DEFAULT '[]'::jsonb, -- [{ id, label, fieldType, options, required, value }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bird Count Records: Tracks daily/weekly counts for poultry
CREATE TABLE IF NOT EXISTS bird_count_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES poultry_profiles(id) ON DELETE CASCADE NOT NULL,
  cage_id TEXT,
  count INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. UPDATE EXISTING TABLES

-- Animals Table: Add new columns
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES poultry_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS animal_type TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS internal_code TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Update Animals health_status check constraint to support more options
ALTER TABLE animals
  DROP CONSTRAINT IF EXISTS animals_health_status_check;

ALTER TABLE animals
  ADD CONSTRAINT animals_health_status_check CHECK (
    health_status IN ('healthy', 'sick', 'recovering', 'quarantined', 'quarantine', 'deceased', 'pregnant', 'lactating', 'dry')
  );

-- Tasks Table: Add attachments and tags columns
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. UPDATE REAL-TIME PUBLICATION (add new tables if needed)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS poultry_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS bird_count_records;

-- 4. SIMPLE RLS POLICIES FOR NEW TABLES (match existing)
ALTER TABLE poultry_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bird_count_records DISABLE ROW LEVEL SECURITY;
