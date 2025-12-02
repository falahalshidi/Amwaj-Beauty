# ✅ تم تحويل المشروع لاستخدام Supabase

## ما تم إنجازه:

1. ✅ إنشاء ملف `src/server/database/supabase.ts` - قاعدة بيانات Supabase
2. ✅ تحديث `src/server/routes/products.ts` - استخدام Supabase
3. ✅ تحديث `src/server/routes/orders.ts` - استخدام Supabase  
4. ✅ تحديث `src/server/routes/auth.ts` - استخدام Supabase
5. ✅ إضافة `@supabase/supabase-js` إلى `package.json`

## الخطوات المطلوبة:

### 1. إضافة Service Role Key (مهم جداً!)

**للحصول على Service Role Key:**
1. اذهب إلى: https://supabase.com/dashboard/project/flivraxgfeqrguienahe/settings/api
2. انسخ **service_role** key (⚠️ سري جداً)
3. أضفه في `.env`:

```env
SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. اختبار محلي

```bash
npm run dev
```

### 4. إضافة بيانات تجريبية (اختياري)

يمكنك إضافة منتجات من Supabase Dashboard → Table Editor → products

أو استخدام SQL:

```sql
INSERT INTO products (name, description, price, image, quantity) 
VALUES 
  ('منتج تجريبي 1', 'وصف المنتج', 50.00, 'https://example.com/image.jpg', 10),
  ('منتج تجريبي 2', 'وصف المنتج', 75.00, 'https://example.com/image2.jpg', 5);
```

## التحقق من النجاح:

1. ✅ المنتجات تظهر في صفحة المنتجات
2. ✅ يمكن إنشاء طلبات جديدة
3. ✅ يمكن تسجيل الدخول وإنشاء حسابات
4. ✅ لوحة التحكم تعمل

## ملاحظات:

- **Backend** يستخدم Service Role Key (يتجاوز RLS)
- **Frontend** يستخدم Anon Key (يخضع لـ RLS)
- البيانات الآن في Supabase وليس في ملفات JSON

## إذا لم تظهر البيانات:

1. تحقق من أن Service Role Key موجود في `.env`
2. تحقق من أن الجداول موجودة في Supabase
3. تحقق من أن RLS policies صحيحة
4. أضف بيانات تجريبية في Supabase Dashboard

