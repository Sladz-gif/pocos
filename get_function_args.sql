-- Get function arguments using pg_function_arguments
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
WHERE p.proname = 'request_live_view';
