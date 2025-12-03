-- Fix RLS policy to allow users to insert themselves into users table
-- This is needed when the trigger doesn't fire or user is created manually

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;

-- Allow service role to insert (for trigger)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- Allow users to insert themselves (for manual creation when trigger fails)
CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also update the trigger function to set is_admin for admin@amwajbeauty.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  is_admin_user BOOLEAN;
BEGIN
  -- Try to get name from user_metadata (check multiple possible keys)
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    SPLIT_PART(NEW.email, '@', 1) -- Fallback to email username
  );
  
  -- Check if email is admin@amwajbeauty.com
  is_admin_user := LOWER(NEW.email) = 'admin@amwajbeauty.com';
  
  INSERT INTO public.users (id, name, email, is_admin)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    is_admin_user
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
    ),
    is_admin = COALESCE(EXCLUDED.is_admin, is_admin_user, users.is_admin);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

