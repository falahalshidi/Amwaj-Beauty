# تطبيق Migration على Supabase

## الطريقة السريعة (مباشرة من Dashboard):

1. اذهب إلى: https://flivraxgfeqrguienahe.supabase.co
2. سجل الدخول إلى Dashboard
3. اذهب إلى **SQL Editor** من القائمة الجانبية
4. انسخ محتوى ملف `20240101000000_create_initial_schema.sql`
5. الصق في SQL Editor واضغط **Run**

## أو استخدم Supabase CLI:

```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref flivraxgfeqrguienahe

# تطبيق migration
supabase db push
```

## الجداول التي سيتم إنشاؤها:

✅ **users** - جدول المستخدمين
✅ **products** - جدول المنتجات  
✅ **orders** - جدول الطلبات

جميع الجداول مع:
- Indexes للأداء
- Foreign Keys
- Row Level Security (RLS)
- Triggers لتحديث timestamps

