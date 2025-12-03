-- ============================================
-- إصلاح شامل لجميع المشاكل في قاعدة البيانات
-- ============================================
-- هذا الملف يحل جميع المشاكل المتعلقة بـ:
-- 1. Foreign key constraint violations
-- 2. RLS policies
-- 3. User creation triggers
-- 4. Admin user setup
-- ============================================

-- ============================================
-- 1. إصلاح RLS Policies للمستخدمين
-- ============================================

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role or users can update profile" ON users;

-- السماح للمستخدمين بإنشاء أنفسهم (مهم جداً!)
CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- السماح لـ service role بإنشاء المستخدمين (للـ trigger)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- السماح للمستخدمين بقراءة ملفهم الشخصي
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- السماح للمستخدمين بتحديث ملفهم الشخصي
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NULL OR -- Service role
    auth.uid() = id -- User updating their own profile
  );

-- ============================================
-- 2. تحديث Trigger Function لإنشاء المستخدمين
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  is_admin_user BOOLEAN;
BEGIN
  -- الحصول على الاسم من user_metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    SPLIT_PART(NEW.email, '@', 1) -- Fallback to email username
  );
  
  -- التحقق من أن البريد هو admin@amwajbeauty.com
  is_admin_user := LOWER(NEW.email) = 'admin@amwajbeauty.com';
  
  -- إنشاء المستخدم في جدول users
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
    -- إذا كان البريد admin@amwajbeauty.com، اجعله admin
    is_admin = CASE 
      WHEN LOWER(NEW.email) = 'admin@amwajbeauty.com' THEN true
      ELSE COALESCE(EXCLUDED.is_admin, users.is_admin)
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. التأكد من وجود الـ Trigger
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. إصلاح RLS Policies للطلبات (Orders)
-- ============================================

DROP POLICY IF EXISTS "Service role or users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

-- السماح للمستخدمين بإنشاء طلباتهم
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR -- Service role
    auth.uid() = user_id -- User creating their own order
  );

-- ============================================
-- 5. حذف عمود password إذا كان موجوداً (لأن Supabase Auth يدير كلمات المرور)
-- ============================================

-- التحقق من وجود عمود password وحذفه إذا كان موجوداً
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE public.users DROP COLUMN password;
    RAISE NOTICE 'Column password dropped successfully';
  ELSE
    RAISE NOTICE 'Column password does not exist, skipping';
  END IF;
END $$;

-- ============================================
-- 6. إنشاء/تحديث المستخدمين الموجودين في Auth
-- ============================================

-- إنشاء سجل في جدول users لكل مستخدم موجود في auth.users لكن غير موجود في users
INSERT INTO public.users (id, name, email, is_admin)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'display_name',
    SPLIT_PART(au.email, '@', 1)
  ) as name,
  au.email,
  CASE 
    WHEN LOWER(au.email) = 'admin@amwajbeauty.com' THEN true
    ELSE false
  END as is_admin
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name),
  is_admin = CASE 
    WHEN LOWER(EXCLUDED.email) = 'admin@amwajbeauty.com' THEN true
    ELSE users.is_admin
  END;

-- ============================================
-- 7. تحديث المستخدمين الموجودين ليكونوا admin إذا كان بريدهم admin@amwajbeauty.com
-- ============================================

UPDATE public.users
SET is_admin = true
WHERE LOWER(email) = 'admin@amwajbeauty.com'
  AND is_admin = false;

-- ============================================
-- 8. التحقق من Foreign Key Constraints
-- ============================================

-- التأكد من أن جميع الطلبات تشير إلى مستخدمين موجودين
-- (هذا سيفشل إذا كان هناك طلبات لمستخدمين غير موجودين)
-- يمكنك حذف الطلبات القديمة إذا لزم الأمر:
-- DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);

-- ============================================
-- تم الانتهاء!
-- ============================================
-- الآن يجب أن يعمل الموقع بشكل صحيح:
-- ✅ المستخدمون يمكنهم إنشاء أنفسهم في جدول users
-- ✅ Trigger ينشئ المستخدمين تلقائياً
-- ✅ admin@amwajbeauty.com يصبح admin تلقائياً
-- ✅ الطلبات يمكن إنشاؤها بدون مشاكل foreign key
-- ============================================

