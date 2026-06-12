-- POCOS Clear Sample Data Script
-- Run this to remove all sample data from the database
-- This will DELETE all data from all tables

-- Disable foreign key checks temporarily to allow deletion in any order
SET session_replication_role = 'replica';

-- Delete from child tables first (tables with foreign keys)
DELETE FROM analytics_snapshots;
DELETE FROM activity_logs;
DELETE FROM saved_listings;
DELETE FROM discounts;
DELETE FROM orders;
DELETE FROM store_listings;
DELETE FROM delivery_addresses;
DELETE FROM payment_methods;
DELETE FROM chat_messages;
DELETE FROM channel_participants;
DELETE FROM chat_channels;
DELETE FROM notes;
DELETE FROM task_comments;
DELETE FROM subtasks;
DELETE FROM tasks;
DELETE FROM feed_records;
DELETE FROM pregnancy_records;
DELETE FROM medication_records;
DELETE FROM bird_count_records;
DELETE FROM bird_cages;
DELETE FROM animals;
DELETE FROM profiles;
DELETE FROM ranch_users;
DELETE FROM ranch;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset sequences (optional - if you want IDs to start from 1 again)
-- Uncomment the lines below if you want to reset auto-increment IDs
/*
SELECT setval('ranch_id_seq', 1, false);
SELECT setval('ranch_users_id_seq', 1, false);
SELECT setval('animals_id_seq', 1, false);
SELECT setval('profiles_id_seq', 1, false);
SELECT setval('bird_cages_id_seq', 1, false);
SELECT setval('bird_count_records_id_seq', 1, false);
SELECT setval('tasks_id_seq', 1, false);
SELECT setval('subtasks_id_seq', 1, false);
SELECT setval('task_comments_id_seq', 1, false);
SELECT setval('chat_channels_id_seq', 1, false);
SELECT setval('chat_messages_id_seq', 1, false);
SELECT setval('channel_participants_id_seq', 1, false);
SELECT setval('store_listings_id_seq', 1, false);
SELECT setval('orders_id_seq', 1, false);
SELECT setval('discounts_id_seq', 1, false);
SELECT setval('saved_listings_id_seq', 1, false);
SELECT setval('delivery_addresses_id_seq', 1, false);
SELECT setval('payment_methods_id_seq', 1, false);
SELECT setval('medication_records_id_seq', 1, false);
SELECT setval('pregnancy_records_id_seq', 1, false);
SELECT setval('feed_records_id_seq', 1, false);
SELECT setval('activity_logs_id_seq', 1, false);
SELECT setval('analytics_snapshots_id_seq', 1, false);
SELECT setval('notes_id_seq', 1, false);
*/

-- Verify all tables are empty
SELECT 
  schemaname,
  relname as tablename,
  n_tup_ins - n_tup_del as total_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
