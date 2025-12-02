-- Fix RLS policies to allow service role and backend access
-- Service Role Key bypasses RLS, but we need to allow operations when auth.uid() is null

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Products: Allow service role OR admins
CREATE POLICY "Service role or admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR -- Service role (no user context)
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Service role or admins can update products"
  ON products FOR UPDATE
  USING (
    auth.uid() IS NULL OR -- Service role
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Service role or admins can delete products"
  ON products FOR DELETE
  USING (
    auth.uid() IS NULL OR -- Service role
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Orders: Allow service role OR users/admins
CREATE POLICY "Service role or users can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR -- Service role
    auth.uid() = user_id -- User creating their own order
  );

CREATE POLICY "Service role or admins can update orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() IS NULL OR -- Service role
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Users: Allow service role OR users themselves
CREATE POLICY "Service role or users can update profile"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NULL OR -- Service role
    auth.uid() = id -- User updating their own profile
  );

