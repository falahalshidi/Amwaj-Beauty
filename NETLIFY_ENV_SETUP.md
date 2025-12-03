# إعداد متغيرات البيئة في Netlify

## المشكلة
ملف `.env` لا يُرفع مع المشروع (لأنه في `.gitignore`) ولا يعمل في بيئة الإنتاج على Netlify.

## الحل: إضافة Environment Variables في Netlify

### الخطوات:

1. **اذهب إلى Netlify Dashboard:**
   - افتح [Netlify Dashboard](https://app.netlify.com)
   - اختر موقعك (Site)

2. **افتح إعدادات الموقع:**
   - اضغط على **Site settings** (أو **Site configuration**)
   - من القائمة الجانبية، اختر **Environment variables**

3. **أضف المتغيرات التالية:**

   اضغط على **Add variable** وأضف:

   **المتغير الأول:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://your-project-id.supabase.co`
     - استبدل `your-project-id` بـ Project ID الخاص بك من Supabase

   **المتغير الثاني:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `your-anon-key-here`
     - هذا هو الـ anon/public key من Supabase

4. **كيفية الحصول على القيم من Supabase:**

   - اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
   - اختر مشروعك
   - اذهب إلى **Settings** → **API**
   - انسخ:
     - **Project URL** → ضعه في `VITE_SUPABASE_URL`
     - **anon/public key** (ليس service_role) → ضعه في `VITE_SUPABASE_ANON_KEY`

5. **أعد النشر (Redeploy):**
   - بعد إضافة المتغيرات، اذهب إلى **Deploys**
   - اضغط على **Trigger deploy** → **Clear cache and deploy site**
   - أو ادفع أي تغيير إلى GitHub وسيتم النشر تلقائياً

## مثال:

في Netlify Environment Variables:

```
VITE_SUPABASE_URL = https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1NTc2MDAwfQ.example
```

## ⚠️ ملاحظات مهمة:

1. **لا تضع القيم الحقيقية في الكود** - استخدم Environment Variables دائماً
2. **تأكد من استخدام anon/public key** وليس service_role key
3. **بعد إضافة المتغيرات، يجب إعادة النشر** حتى تعمل
4. **المتغيرات تبدأ بـ `VITE_`** لأن المشروع يستخدم Vite

## 🔍 التحقق من أن المتغيرات تعمل:

1. بعد النشر، افتح الموقع
2. افتح Developer Console (F12)
3. ابحث عن رسالة: `✅ Supabase client initialized`
4. إذا رأيت `❌ Missing Supabase environment variables!` فهذا يعني أن المتغيرات لم تُضف بشكل صحيح

## 🐛 استكشاف الأخطاء:

### المشكلة: "Missing Supabase environment variables"
- **الحل:** تأكد من إضافة المتغيرات في Netlify Environment Variables
- تأكد من أن الـ Key يبدأ بـ `VITE_`
- أعد النشر بعد إضافة المتغيرات

### المشكلة: "Invalid Supabase URL"
- **الحل:** تأكد من أن الـ URL يبدأ بـ `https://`
- تأكد من نسخ Project URL كاملاً من Supabase

### المشكلة: قاعدة البيانات لا تعمل
- **الحل:** 
  - تأكد من أن RLS (Row Level Security) policies موجودة
  - تأكد من أن الـ anon key صحيح
  - تحقق من Supabase Logs

## 📸 لقطات شاشة (Screenshots Guide):

### في Netlify:
1. Site settings → Environment variables
2. Add variable
3. أدخل Key و Value
4. Save

### في Supabase:
1. Settings → API
2. انسخ Project URL و anon/public key

---

**بعد إضافة المتغيرات وإعادة النشر، يجب أن يعمل الموقع بشكل صحيح! 🎉**

