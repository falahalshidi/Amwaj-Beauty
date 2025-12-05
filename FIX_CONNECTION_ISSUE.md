# إصلاح مشكلة الاتصال بـ Supabase

## المشكلة:
عند إنشاء حساب جديد أو تسجيل الدخول، تظهر رسالة:
- "Failed to fetch" 
- "فشل الاتصال بالخادم. تحقق من اتصال الإنترنت ومتغيرات Supabase"

## الحل:

### 1. تأكد من وجود ملف `.env` في المجلد الرئيسي

الملف يجب أن يكون في نفس المجلد الذي فيه `package.json`

### 2. أضف المحتوى التالي إلى ملف `.env`:

```env
VITE_SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaXZyYXhnZmVxcmd1aWVuYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODY4ODksImV4cCI6MjA4MDI2Mjg4OX0.w3WvowrDngrc6N_zQOIQ8sFBhVq2gkhB01suGiJJNW0
```

### 3. تأكد من:
- ✅ لا توجد مسافات قبل أو بعد القيم
- ✅ لا توجد علامات اقتباس حول القيم
- ✅ الملف محفوظ بشكل صحيح

### 4. أعد تشغيل السيرفر:

```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### 5. تحقق من النجاح:

افتح Console في المتصفح (F12) وابحث عن:
- ✅ `✅ Supabase client initialized` = نجح!
- ❌ `❌ Missing Supabase environment variables!` = تحقق من `.env` مرة أخرى

## إذا استمرت المشكلة:

### 1. تحقق من اتصال الإنترنت
- تأكد من أنك متصل بالإنترنت
- جرب فتح: https://flivraxgfeqrguienahe.supabase.co في المتصفح

### 2. تحقق من Console في المتصفح (F12)
- ابحث عن أي أخطاء باللون الأحمر
- انسخ رسالة الخطأ وأرسلها

### 3. تحقق من ملف `.env`
- تأكد من أن الملف موجود في المجلد الصحيح
- تأكد من أن القيم صحيحة (انسخها من هنا مباشرة)

### 4. أعد تشغيل السيرفر
- أوقف السيرفر تماماً (Ctrl+C)
- شغّله مرة أخرى: `npm run dev`

## ملاحظات مهمة:

- ⚠️ **لا تشارك ملف `.env`** - يحتوي على مفاتيح سرية
- ✅ يجب أن يبدأ URL بـ `https://`
- ✅ المفتاح طويل جداً - تأكد من نسخه كاملاً
- ✅ المتغيرات يجب أن تبدأ بـ `VITE_` حتى تعمل مع Vite

## إذا لم يعمل بعد:

1. افتح ملف `src/client/supabase.ts`
2. تحقق من أن الكود يقرأ المتغيرات بشكل صحيح
3. افتح Console (F12) وابحث عن رسائل الخطأ
4. تأكد من أن Supabase project نشط في Dashboard

