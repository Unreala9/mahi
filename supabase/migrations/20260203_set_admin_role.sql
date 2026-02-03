-- Function to set a user as admin (can only be called by service_role or existing admins)
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's role to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  RAISE NOTICE 'User % has been set as admin', user_email;
END;
$$;

-- Grant execute permission to authenticated users (though RLS will still protect it)
GRANT EXECUTE ON FUNCTION set_user_as_admin(TEXT) TO authenticated;

-- Comment explaining usage
COMMENT ON FUNCTION set_user_as_admin IS
'Sets a user as admin. Usage: SELECT set_user_as_admin(''user@example.com'');
This function should be called from the SQL editor in Supabase dashboard or via service role.';

-- Alternative: Direct SQL to set first user as admin (uncomment if needed)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
