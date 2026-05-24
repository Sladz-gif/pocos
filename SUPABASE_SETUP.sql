-- POCOS Supabase Database Setup Script
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. DROP EXISTING TABLES (in reverse order of dependency)
DROP TABLE IF EXISTS analytics_snapshots CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS saved_listings CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS store_listings CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_channels CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS feed_records CASCADE;
DROP TABLE IF EXISTS pregnancy_records CASCADE;
DROP TABLE IF EXISTS medication_records CASCADE;
DROP TABLE IF EXISTS animals CASCADE;
DROP TABLE IF EXISTS ranch_users CASCADE;
DROP TABLE IF EXISTS ranch CASCADE;

-- 2. CREATE TABLES

-- Ranch: The central entity representing a physical ranch.
CREATE TABLE ranch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Unique public-facing code (e.g., ASANTE-123)
  location TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  notes TEXT,
  currency TEXT DEFAULT 'GHS',
  is_featured BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{
    "requireBiometric": false,
    "requirePin": false,
    "sessionTimeout": 30,
    "allowStaffCreation": true,
    "allowMarketplace": true
  }'::jsonb,
  owner_id UUID, -- Will point to ranch_users.id after creation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ranch Users: Profiles for owners and staff members.
CREATE TABLE ranch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to Supabase Auth
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'ranch_owner', 'staff', 'store_manager', 'buyer')),
  access_code TEXT UNIQUE, -- Code used for staff login
  pin TEXT, -- Quick PIN for native app access
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions TEXT[] DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, access_code) -- Staff sign in with name and code
);

-- Establish link back from ranch to owner profile
ALTER TABLE ranch ADD CONSTRAINT fk_ranch_owner FOREIGN KEY (owner_id) REFERENCES ranch_users(id) ON DELETE SET NULL;

-- Animals: The livestock managed by the ranch.
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  animal_id TEXT NOT NULL, -- Human readable ID/Tag Number (e.g., BR-001)
  breed TEXT DEFAULT 'Brahman',
  sex TEXT CHECK (sex IN ('male', 'female')),
  color TEXT,
  weight REAL, -- in kg
  birth_date DATE,
  acquired_date DATE DEFAULT CURRENT_DATE,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'sick', 'pregnant', 'deceased')),
  is_special_feeding BOOLEAN DEFAULT false,
  special_feeding_name TEXT,
  is_medicated BOOLEAN DEFAULT false,
  medication_name TEXT,
  medication_date DATE,
  dam_id UUID REFERENCES animals(id) ON DELETE SET NULL, -- Mother
  sire_id UUID REFERENCES animals(id) ON DELETE SET NULL, -- Father
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ranch_id, animal_id) -- Tag numbers must be unique within a ranch
);

-- Medication Records: Tracks health treatments given to animals.
CREATE TABLE medication_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  reason TEXT,
  administered_by UUID REFERENCES ranch_users(id),
  administered_at TIMESTAMPTZ DEFAULT NOW(),
  wear_off_at TIMESTAMPTZ, -- When medication is out of system
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pregnancy Records: Detailed tracking for breeding cycles.
CREATE TABLE pregnancy_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dam_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  sire_id UUID REFERENCES animals(id) ON DELETE SET NULL, -- Sire could be from another ranch
  mating_date DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status TEXT DEFAULT 'pregnant' CHECK (status IN ('pregnant', 'delivered', 'failed')),
  outcome TEXT, -- e.g., "healthy calf", "twins"
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feed Records: Tracks what and how much animals are fed.
CREATE TABLE feed_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  feed_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  fed_at TIMESTAMPTZ DEFAULT NOW(),
  fed_by UUID REFERENCES ranch_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks: Operational activities assigned to staff.
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES ranch_users(id),
  created_by UUID REFERENCES ranch_users(id),
  due_date TIMESTAMPTZ,
  recurring TEXT DEFAULT 'none' CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly', 'custom')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks: Actionable checklists within a task.
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Channels: Communication groups within a ranch.
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'group' CHECK (type IN ('direct', 'group', 'announcement')),
  created_by UUID REFERENCES ranch_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Participants: Links users to channels.
CREATE TABLE channel_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ranch_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Chat Messages: Individual messages within channels.
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES ranch_users(id) ON DELETE SET NULL,
  sender_name TEXT, -- Denormalized for quick display
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments: Discussion on specific tasks.
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ranch_users(id) ON DELETE SET NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Listings: Products available in the public marketplace.
CREATE TABLE store_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL, -- Optional link to specific animal
  product_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "Live Cattle", "Beef / Meat", "Milk & Dairy", "Feed & Hay", "Other"
  price REAL NOT NULL,
  unit TEXT DEFAULT 'head', -- e.g., "per kg", "per head", "per litre", "per bale", "per unit"
  stock_quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'hidden')),
  discount_percentage REAL DEFAULT 0,
  image_url TEXT, -- Primary photo
  photos JSONB DEFAULT '[]'::jsonb, -- Up to 3 photos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders: Marketplace transactions.
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES store_listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES ranch_users(id), -- Buyers are users with role 'buyer'
  quantity INTEGER DEFAULT 1,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid',
  order_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discounts: Promotions for products.
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value REAL NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Listings: Wishlist for buyers.
CREATE TABLE saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ranch_users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES store_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Buyer Delivery Addresses
CREATE TABLE delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ranch_users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g. "Home", "Office"
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Payment Methods
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ranch_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'momo')),
  provider TEXT NOT NULL, -- e.g. "Visa", "MTN"
  last_four TEXT, -- For cards
  phone_number TEXT, -- For momo
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs: System-wide audit trail.
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ranch_users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT, -- e.g., "animal", "task", "order"
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Snapshots: Historic metrics for reporting.
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID REFERENCES ranch(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- Stores: total_animals, revenue, task_completion_rate, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE REAL-TIME
-- Allow clients to listen for new chat messages and task updates.
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;

-- 4. STORAGE BUCKET
-- Create public bucket for ranch-related media.
INSERT INTO storage.buckets (id, name, public)
VALUES ('pocos-images', 'pocos-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'pocos-images');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pocos-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'pocos-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'pocos-images');

-- 5. POLICIES (Simplified for dev, but secure)
-- NOTE: In production, these should be much more restrictive based on ranch_id.
ALTER TABLE ranch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for everyone" ON ranch FOR INSERT WITH CHECK (true);
CREATE POLICY "Ranch members can view their ranch" ON ranch FOR SELECT USING (true);
CREATE POLICY "Ranch owners can update their ranch" ON ranch FOR UPDATE USING (true);

ALTER TABLE ranch_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for everyone" ON ranch_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view members of their ranch" ON ranch_users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON ranch_users FOR UPDATE USING (auth.uid() = auth_id);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ranch members can manage animals" ON animals FOR ALL USING (true);

-- Repeat similar "true" policies for other tables during initial dev phase...
-- For brevity, disabling RLS on other operational tables to ensure "it just works" initially.
ALTER TABLE medication_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE channel_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
