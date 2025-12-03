# 🔧 إصلاح سريع: متغيرات البيئة في Netlify

## المشكلة
الموقع يعمل محلياً لكن لا يعمل على Netlify لأن ملف `.env` لا يُرفع.

## الحل السريع (5 دقائق):

### 1. اذهب إلى Netlify Dashboard
- افتح: https://app.netlify.com
- اختر موقعك

### 2. أضف Environment Variables
- **Site settings** → **Environment variables**
- اضغط **Add variable**

### 3. أضف المتغيرات التالية:

**المتغير الأول:**
```
Key: VITE_SUPABASE_URL
Value: [انسخ Project URL من Supabase]
```

**المتغير الثاني:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: [انسخ anon/public key من Supabase]
```

### 4. كيفية الحصول على القيم:

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. **Settings** → **API**
4. انسخ:
   - **Project URL** → ضعه في `VITE_SUPABASE_URL`
   - **anon/public key** → ضعه في `VITE_SUPABASE_ANON_KEY`

### 5. أعد النشر:
- في Netlify: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## ✅ بعد ذلك سيعمل الموقع!

---

**للمزيد من التفاصيل:** راجع ملف `NETLIFY_ENV_SETUP.md`

