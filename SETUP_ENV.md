# إعداد ملف .env - خطوات سريعة

## المشكلة الحالية:
ملف `.env` موجود لكنه فارغ، لذلك الموقع لا يستطيع الاتصال بـ Supabase.

## الحل السريع:

### 1. افتح ملف `.env` في المجلد الرئيسي

### 2. أضف المحتوى التالي:

```env
VITE_SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 3. احصل على Anon Key:

1. اذهب إلى: https://supabase.com/dashboard/project/flivraxgfeqrguienahe/settings/api
2. ابحث عن **"anon/public" key**
3. انسخ المفتاح (طويل جداً، يبدأ عادة بـ `eyJ...`)
4. الصقه مكان `YOUR_ANON_KEY_HERE` في ملف `.env`

### 4. مثال على الملف النهائي:

```env
VITE_SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaXZyYXhnZmVxcmd1aWVuYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.example
```

### 5. أعد تشغيل السيرفر:

```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

## التحقق من النجاح:

بعد إعادة التشغيل، افتح Console (F12) وابحث عن:
- ✅ `✅ Supabase client initialized` = نجح!
- ❌ `❌ Missing Supabase environment variables!` = تحقق من `.env` مرة أخرى

## ملاحظات مهمة:

- ⚠️ **لا تشارك ملف `.env`** - يحتوي على مفاتيح سرية
- ✅ تأكد من عدم وجود مسافات قبل/بعد القيم
- ✅ تأكد من أن المفتاح كامل (عادة طويل جداً)
- ✅ يجب أن يبدأ URL بـ `https://`

## إذا استمرت المشكلة:

1. تأكد من حفظ ملف `.env`
2. تأكد من إعادة تشغيل السيرفر
3. افتح Console (F12) وابحث عن الأخطاء
4. تحقق من أن المفتاح صحيح من Supabase Dashboard

