# إعداد متغيرات البيئة

## المشكلة: صفحة بيضاء

إذا كانت الصفحة بيضاء، السبب على الأرجح هو عدم وجود متغيرات Supabase.

## الحل:

### 1. أنشئ ملف `.env` في المجلد الرئيسي

في المجلد `c:\Users\falah\Desktop\am\` أنشئ ملف اسمه `.env`

### 2. أضف المحتوى التالي:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. كيفية الحصول على القيم:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك (أو أنشئ مشروع جديد)
3. اذهب إلى **Settings** → **API**
4. انسخ:
   - **Project URL** → ضعه في `VITE_SUPABASE_URL`
   - **anon/public key** → ضعه في `VITE_SUPABASE_ANON_KEY`

### 4. مثال:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1NTc2MDAwfQ.example
```

### 5. أعد تشغيل السيرفر

بعد إنشاء ملف `.env`:
- أوقف السيرفر (Ctrl+C)
- شغّل مرة أخرى: `npm run dev`

## ملاحظات:

- ملف `.env` يجب أن يكون في نفس المجلد الذي فيه `package.json`
- المتغيرات يجب أن تبدأ بـ `VITE_` حتى تعمل مع Vite
- لا تشارك ملف `.env` - أضفه إلى `.gitignore`

## إذا استمرت المشكلة:

1. افتح **Developer Console** في المتصفح (F12)
2. ابحث عن الأخطاء في Console
3. تأكد من أن ملف `.env` موجود وأن القيم صحيحة
4. تأكد من إعادة تشغيل السيرفر بعد إضافة `.env`

