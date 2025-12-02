# 🗄️ قاعدة البيانات - Supabase

## ✅ تم إنشاء Migration جاهز

تم إنشاء ملف migration كامل يحتوي على جميع الجداول المطلوبة.

---

## 🚀 تطبيق Migration (3 طرق)

### الطريقة 1: من Supabase Dashboard (الأسهل) ⭐

1. **افتح Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/flivraxgfeqrguienahe
   ```

2. **افتح SQL Editor:**
   - من القائمة الجانبية → **SQL Editor**

3. **انسخ والصق:**
   - افتح ملف: `supabase/migrations/20240101000000_create_initial_schema.sql`
   - انسخ كل المحتوى (Ctrl+A ثم Ctrl+C)
   - الصق في SQL Editor (Ctrl+V)
   - اضغط **Run** أو `Ctrl+Enter`

4. **تحقق:**
   - اذهب إلى **Table Editor**
   - يجب أن ترى 3 جداول: `users`, `products`, `orders`

---

### الطريقة 2: استخدام Supabase CLI

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

---

### الطريقة 3: استخدام MCP (يحتاج Access Token)

للحصول على Access Token:
1. اذهب إلى: https://supabase.com/dashboard/account/tokens
2. أنشئ Access Token جديد
3. حدّث ملف `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_ACCESS_TOKEN_HERE"
      ]
    }
  }
}
```

ثم أعد تشغيل Cursor.

---

## 📊 الجداول المُنشأة

### 1. `users` - المستخدمين
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- password (TEXT)
- is_admin (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

### 2. `products` - المنتجات
```sql
- id (UUID, Primary Key)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- image (TEXT)
- quantity (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 3. `orders` - الطلبات
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users.id)
- product_id (UUID, Foreign Key → products.id)
- product_name (TEXT)
- quantity (INTEGER)
- total_price (DECIMAL)
- shipping_info (JSONB)
- status (TEXT: 'pending' | 'preparing' | 'shipped' | 'completed')
- created_at (TIMESTAMPTZ)
```

---

## 🔐 الأمان (Row Level Security)

تم تفعيل RLS على جميع الجداول:

- **users**: المستخدمون يرون ويعدلون بياناتهم فقط
- **products**: مرئية للجميع، لكن فقط المديرين يمكنهم التعديل
- **orders**: المستخدمون يرون طلباتهم فقط، المديرون يرون كل شيء

---

## 📝 متغيرات البيئة

أضف في ملف `.env`:

```env
VITE_SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_we4IdG_lg1BPbyD1kwTTxg_b0T1RDV6
```

---

## ✅ التحقق من النجاح

بعد تطبيق migration، تحقق من:

1. **الجداول موجودة:**
   - Table Editor → يجب أن ترى 3 جداول

2. **الـ Indexes موجودة:**
   - Database → Indexes

3. **RLS Policies موجودة:**
   - Authentication → Policies

---

## 🆘 حل المشاكل

### خطأ: "relation already exists"
- الجداول موجودة مسبقاً
- استخدم `DROP TABLE` أولاً أو استخدم `CREATE TABLE IF NOT EXISTS` (موجود في migration)

### خطأ: "permission denied"
- تأكد من استخدام Service Role Key أو أنك مسجل دخول كـ Owner

### خطأ: "extension uuid-ossp does not exist"
- Supabase يدعم UUID تلقائياً، يمكن حذف سطر `CREATE EXTENSION`

---

## 📚 الملفات

- `migrations/20240101000000_create_initial_schema.sql` - ملف Migration الرئيسي
- `QUICK_APPLY.md` - دليل سريع
- `APPLY_MIGRATION.md` - دليل مفصل

