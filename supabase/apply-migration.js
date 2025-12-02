/**
 * Script لتطبيق Migration على Supabase
 * 
 * الاستخدام:
 * node supabase/apply-migration.js
 * 
 * تأكد من إضافة متغيرات البيئة:
 * SUPABASE_URL=https://flivraxgfeqrguienahe.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

const fs = require('fs');
const path = require('path');

// قراءة ملف migration
const migrationFile = path.join(__dirname, 'migrations', '20240101000000_create_initial_schema.sql');
const sql = fs.readFileSync(migrationFile, 'utf-8');

console.log('📦 جاري تطبيق Migration...\n');
console.log('ملاحظة: هذا الـ script يحتاج Service Role Key من Supabase\n');
console.log('للحصول على Service Role Key:');
console.log('1. اذهب إلى Supabase Dashboard');
console.log('2. Project Settings → API');
console.log('3. انسخ Service Role Key (secret)\n');
console.log('أو استخدم SQL Editor مباشرة من Dashboard:\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(sql);
console.log('\n═══════════════════════════════════════════════════════════\n');
console.log('✅ انسخ الكود أعلاه والصقه في Supabase SQL Editor واضغط Run');

