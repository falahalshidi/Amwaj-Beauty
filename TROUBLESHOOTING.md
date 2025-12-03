# حل مشاكل "Failed to fetch"

## المشكلة: "Failed to fetch" عند تسجيل الدخول

### الأسباب المحتملة:

### 1. ❌ متغيرات البيئة غير موجودة أو خاطئة

**الحل:**
1. تأكد من وجود ملف `.env` في المجلد الرئيسي
2. تأكد من أن الملف يحتوي على:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **أعد تشغيل السيرفر** بعد إضافة/تعديل `.env`

### 2. ❌ URL أو Key خاطئ

**الحل:**
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. Settings → API
4. انسخ القيم **بدقة** (بدون مسافات إضافية)
5. تأكد من أن URL يبدأ بـ `https://`
6. تأكد من أن Key كامل (عادة طويل جداً)

### 3. ❌ المايجريشنز غير مطبقة

**الحل:**
1. اذهب إلى Supabase Dashboard → SQL Editor
2. طبّق المايجريشنز بالترتيب:
   - `supabase/migrations/20240101000000_create_initial_schema.sql`
   - `supabase/migrations/20240101000001_fix_rls_for_service_role.sql`
   - `supabase/migrations/20240101000002_update_users_for_auth.sql`

### 4. ❌ مشكلة في CORS

**الحل:**
- Supabase يدعم CORS تلقائياً
- إذا استمرت المشكلة، تحقق من إعدادات المشروع في Supabase

### 5. ❌ مشكلة في RLS Policies

**الحل:**
- تأكد من تطبيق المايجريشن `20240101000001_fix_rls_for_service_role.sql`
- هذا المايجريشن يصلح سياسات RLS

## خطوات التحقق:

### 1. تحقق من Console في المتصفح (F12)

ابحث عن:
- ✅ `✅ Supabase client initialized` - يعني الإعداد صحيح
- ❌ `❌ Missing Supabase environment variables!` - يعني `.env` مفقود
- ❌ `Failed to fetch` - يعني مشكلة في الاتصال

### 2. تحقق من ملف `.env`

```bash
# في PowerShell
Get-Content .env
```

يجب أن ترى:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. اختبر الاتصال يدوياً

افتح Console في المتصفح (F12) وجرب:
```javascript
// تحقق من أن Supabase client موجود
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### 4. تحقق من Supabase Dashboard

1. اذهب إلى Authentication → Users
2. تأكد من أن المستخدم موجود (إذا سجلت من قبل)
3. إذا لم يكن موجوداً، أنشئه من Dashboard

## حل سريع:

### إذا كان `.env` غير موجود:

1. أنشئ ملف `.env` في `c:\Users\falah\Desktop\am\`
2. أضف:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key
   ```
3. أوقف السيرفر (Ctrl+C)
4. شغّل: `npm run dev`

### إذا كان `.env` موجود لكن لا يعمل:

1. تأكد من أن المتغيرات تبدأ بـ `VITE_`
2. تأكد من عدم وجود مسافات قبل/بعد القيم
3. أعد تشغيل السيرفر

### إذا استمرت المشكلة:

1. افتح Console (F12)
2. انسخ رسالة الخطأ الكاملة
3. تحقق من:
   - هل URL صحيح؟
   - هل Key صحيح؟
   - هل المايجريشنز مطبقة؟

## رسائل الخطأ الشائعة:

| الرسالة | السبب | الحل |
|---------|-------|------|
| `Missing Supabase environment variables` | `.env` مفقود | أنشئ `.env` |
| `Failed to fetch` | URL/Key خاطئ أو لا يوجد اتصال | تحقق من `.env` وإعادة التشغيل |
| `Invalid login credentials` | البريد/كلمة المرور خاطئة | تحقق من بيانات الدخول |
| `relation does not exist` | المايجريشنز غير مطبقة | طبّق المايجريشنز |

## اختبار الاتصال:

بعد إصلاح `.env`، افتح Console وجرب:
```javascript
// يجب أن يعمل بدون أخطاء
const { data, error } = await supabase.from('products').select('*').limit(1)
console.log('Test:', data, error)
```

إذا نجح، يعني الاتصال يعمل! ✅

