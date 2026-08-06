-- Create or replace the request_live_view function
CREATE OR REPLACE FUNCTION request_live_view(p_asset_id TEXT, p_lease_minutes INTEGER, p_device_secret TEXT)
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

  -- Verify the asset belongs to current user
  IF EXISTS (SELECT 1 FROM assets WHERE asset_id = LOWER(p_asset_id) AND owner_user_id = v_owner_id) THEN
    -- In a real implementation, this would create a lease record
    -- For now, we just return true to indicate the request was accepted
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
