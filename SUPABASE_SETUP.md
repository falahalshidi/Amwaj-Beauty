# إعداد Supabase - دليل الربط الكامل

## ✅ تم ربط كل شيء بـ Supabase!

تم تحديث جميع الملفات لاستخدام Supabase مباشرة بدلاً من API الخلفي.

## المتغيرات المطلوبة

أنشئ ملف `.env` في المجلد الرئيسي وأضف:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### كيفية الحصول على هذه القيم:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى Settings → API
4. انسخ:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## ما تم تحديثه:

### 1. ✅ AuthContext (`src/client/context/AuthContext.tsx`)
- يستخدم `supabase.auth.signUp()` و `supabase.auth.signInWithPassword()`
- يربط بيانات المستخدم من جدول `users`
- يدعم تسجيل الدخول والخروج تلقائياً

### 2. ✅ ProductsPage (`src/client/pages/ProductsPage.tsx`)
- يجلب المنتجات مباشرة من Supabase
- لا يحتاج API خلفي

### 3. ✅ OrderPage (`src/client/pages/OrderPage.tsx`)
- ينشئ الطلبات مباشرة في Supabase
- يحدّث كمية المنتج تلقائياً

### 4. ✅ AdminPanel (`src/client/pages/AdminPanel.tsx`)
- إدارة المنتجات والطلبات مباشرة من Supabase
- جميع العمليات (إضافة، تعديل، حذف) تعمل مباشرة

## قاعدة البيانات

تأكد من تطبيق المايجريشنز:

```bash
# المايجريشن موجود في:
supabase/migrations/20240101000000_create_initial_schema.sql
supabase/migrations/20240101000001_fix_rls_for_service_role.sql
```

### الجداول المطلوبة:
- `users` - المستخدمون
- `products` - المنتجات
- `orders` - الطلبات

## Row Level Security (RLS)

تم تفعيل RLS على جميع الجداول. السياسات تسمح بـ:
- **المنتجات**: الجميع يمكنهم القراءة، فقط الأدمن يمكنه الكتابة
- **الطلبات**: المستخدمون يمكنهم إنشاء طلباتهم، الأدمن يمكنه رؤية الكل
- **المستخدمون**: كل مستخدم يمكنه رؤية/تحديث بياناته فقط

## الخطوات التالية:

1. ✅ أنشئ ملف `.env` وأضف المتغيرات
2. ✅ تأكد من تطبيق المايجريشنز في Supabase
3. ✅ اختبر تسجيل الدخول والتسجيل
4. ✅ أضف منتجات من لوحة التحكم
5. ✅ اختبر إنشاء طلب

## ملاحظات مهمة:

- **لا حاجة لـ Backend API الآن** - كل شيء يعمل مباشرة من Frontend
- **Supabase Auth** يدير المصادقة تلقائياً
- **RLS** يحمي البيانات على مستوى قاعدة البيانات
- عند التسجيل، يتم إنشاء سجل في جدول `users` تلقائياً

## استكشاف الأخطاء:

### خطأ "Missing Supabase environment variables"
- تأكد من وجود ملف `.env`
- تأكد من أن المتغيرات تبدأ بـ `VITE_`
- أعد تشغيل السيرفر بعد إضافة المتغيرات

### خطأ "relation does not exist"
- تأكد من تطبيق المايجريشنز في Supabase
- تحقق من أن الجداول موجودة في Supabase Dashboard

### خطأ RLS policy violation
- تأكد من تسجيل الدخول
- تحقق من أن المستخدم لديه الصلاحيات المطلوبة
- راجع سياسات RLS في المايجريشن

