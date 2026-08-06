-- Check the actual signature of the request_live_view function
SELECT 
  routine_name,
  routine_type,
  data_type,
  external_language
FROM information_schema.routines 
WHERE routine_name = 'request_live_view';

-- Get the function parameters
SELECT 
  parameter_name,
  data_type,
  ordinal_position
FROM information_schema.parameters 
WHERE specific_name = 'request_live_view'
ORDER BY ordinal_position;
