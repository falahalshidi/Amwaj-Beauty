# 🚀 تطبيق Migration بسرعة

## الطريقة الأسهل (من Dashboard):

### الخطوات:

1. **افتح Supabase Dashboard:**
   - اذهب إلى: https://supabase.com/dashboard/project/flivraxgfeqrguienahe

2. **افتح SQL Editor:**
   - من القائمة الجانبية اضغط على **SQL Editor**

3. **انسخ والصق:**
   - افتح ملف: `supabase/migrations/20240101000000_create_initial_schema.sql`
   - انسخ كل المحتوى
   - الصق في SQL Editor
   - اضغط **Run** أو `Ctrl+Enter`

4. **تحقق من النجاح:**
   - اذهب إلى **Table Editor**
   - يجب أن ترى 3 جداول: `users`, `products`, `orders`

---

## ✅ ما سيتم إنشاؤه:

### الجداول:
- ✅ **users** - المستخدمين (id, name, email, password, is_admin, created_at)
- ✅ **products** - المنتجات (id, name, description, price, image, quantity, created_at, updated_at)
- ✅ **orders** - الطلبات (id, user_id, product_id, product_name, quantity, total_price, shipping_info, status, created_at)

### المميزات:
- ✅ UUID Primary Keys
- ✅ Foreign Keys بين الجداول
- ✅ Indexes للأداء
- ✅ Row Level Security (RLS) Policies
- ✅ Triggers لتحديث timestamps تلقائياً
- ✅ Constraints للتحقق من البيانات

---

## 🔐 ملاحظات الأمان:

- RLS مفعل على جميع الجداول
- المستخدمون يمكنهم رؤية وتعديل بياناتهم فقط
- المنتجات مرئية للجميع، لكن فقط المديرين يمكنهم التعديل
- الطلبات مرئية للمستخدمين (طلباتهم فقط) والمديرين (جميع الطلبات)

---

## 📝 بعد التطبيق:

تأكد من إضافة متغيرات البيئة في `.env`:

```env
VITE_SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_we4IdG_lg1BPbyD1kwTTxg_b0T1RDV6
```

