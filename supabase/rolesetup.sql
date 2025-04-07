-- Create super_user role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'super_user') THEN
        CREATE ROLE super_user;
    END IF;
END
$$;

-- Grant necessary permissions to super_user role
GRANT USAGE ON SCHEMA public TO super_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO super_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO super_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO super_user;

-- Grant permission to set role
GRANT super_user TO postgres;
GRANT super_user TO authenticated;

-- Create function to check if user is super_user
CREATE OR REPLACE FUNCTION is_super_user()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = auth.uid() 
        AND role = 'super_user'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_super_user() TO authenticated; 