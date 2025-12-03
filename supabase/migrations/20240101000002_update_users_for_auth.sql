-- Update users table to work with Supabase Auth
-- Remove password column since Supabase Auth handles passwords
-- The id should match auth.users.id

-- Drop password column if it exists (for Supabase Auth, passwords are in auth.users)
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Ensure id matches auth.users.id (UUID from Supabase Auth)
-- Add constraint to ensure users.id references auth.users.id
-- Note: This is a soft reference since we can't add a foreign key to auth.users

-- Create a function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Try to get name from user_metadata (check multiple possible keys)
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    SPLIT_PART(NEW.email, '@', 1) -- Fallback to email username
  );
  
  INSERT INTO public.users (id, name, email, is_admin)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = NEW.email,
    name = COALESCE(
      EXCLUDED.name,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        users.name
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policy for users to allow inserts from trigger
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role or users can update profile" ON users;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow service role or users to update their own profile
CREATE POLICY "Service role or users can update profile"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NULL OR -- Service role
    auth.uid() = id -- User updating their own profile
  );

-- Allow service role to insert (for trigger)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

