-- Get the function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'request_live_view';
