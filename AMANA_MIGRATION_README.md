# AmanA Migration Guide

This guide explains how to migrate the Pocos database to AmanA branding and remove ML/Jetson Nano features.

## Migration Overview

The migration performs the following changes:

### 1. Remove ML/Jetson Nano Features
- Drops `assets` table (Jetson device management)
- Drops `bird_detections` table (ML detection results)
- Drops `device_test_snapshots` table (device health snapshots)
- Removes `device_address` columns from `profiles` and `bird_cages` tables
- Drops related indexes and RLS policies
- Removes Jetson-related RPC functions (`link_coop_device`, `request_test_snapshot`)
- Removes realtime subscriptions for Jetson tables

### 2. Update App Branding to AmanA
- Creates new storage bucket: `amana-images`
- Updates storage policies for the new bucket
- Updates ranch names from "Pocos" to "AmanA"
- Updates ranch codes from "POCOS" to "AMANA"

## How to Run the Migration

### Prerequisites
- Access to Supabase Dashboard
- SQL Editor permissions
- Backup your database before running (recommended)

### Steps

1. **Backup your database**
   - Go to Supabase Dashboard → Database → Backups
   - Create a manual backup before proceeding

2. **Run the migration script**
   - Open Supabase Dashboard → SQL Editor
   - Click "New query"
   - Copy the contents of `AMANA_MIGRATION.sql`
   - Paste and click "Run"
   - Note: The script uses DO $$ blocks to handle policy creation safely

3. **Verify the migration**
   - Check that Jetson tables are dropped:
     ```sql
     SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
     AND tablename IN ('assets', 'bird_detections', 'device_test_snapshots');
     ```
     - Should return 0 rows

   - Check that new storage bucket exists:
     ```sql
     SELECT * FROM storage.buckets WHERE id = 'amana-images';
     ```
     - Should return 1 row

4. **Update image URLs (Optional)**
   - If you have existing images in the old bucket, uncomment and run the data migration section in `AMANA_MIGRATION.sql`
   - This updates references from `pocos-images` to `amana-images`

5. **Update app configuration**
   - The app.json already uses "AmanA" branding
   - Update any hardcoded references in your code if needed

## Rollback

If you need to revert the changes (restore Jetson features and Pocos branding):

1. **Run the rollback script**
   - Open Supabase Dashboard → SQL Editor
   - Copy the contents of `AMANA_ROLLBACK.sql`
   - Paste and click "Run"

2. **Manual steps for storage**
   - You'll need to manually restore data from `amana-images` to `pocos-images` if needed
   - Update the bucket reference in app config
   - Drop the `amana-images` bucket if no longer needed

## Important Notes

### Storage Bucket
- Storage buckets cannot be renamed in Supabase
- The migration creates a new `amana-images` bucket
- The old `pocos-images` bucket is NOT automatically deleted
- You can keep both buckets or manually migrate data and delete the old one

### Data Loss
- All Jetson-related data will be permanently deleted
- This includes:
  - Device assets and their configurations
  - Bird detection records
  - Device test snapshots
  - Device address mappings

### App Code Changes
- The migration only affects the database
- Ensure your app code has been updated to:
  - Remove Jetson-related API calls
  - Update any hardcoded "Pocos" references to "AmanA"
  - Use the new storage bucket name if referencing it directly

## Verification Checklist

After running the migration, verify:

- [ ] Jetson tables are dropped (assets, bird_detections, device_test_snapshots)
- [ ] Device address columns removed from profiles and bird_cages
- [ ] New storage bucket `amana-images` exists
- [ ] Ranch names updated from "Pocos" to "AmanA"
- [ ] Ranch codes updated from "POCOS" to "AMANA"
- [ ] App still functions correctly
- [ ] No errors in console related to missing Jetson features

## Support

If you encounter issues:
1. Check the Supabase logs for errors
2. Verify all tables were dropped correctly
3. Ensure RLS policies are properly configured
4. Use the rollback script if needed
5. Restore from backup if necessary

## Date
Migration created: 2026-10-02
