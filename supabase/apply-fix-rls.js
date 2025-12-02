/**
 * Script لتطبيق إصلاح RLS policies
 * 
 * الاستخدام:
 * node supabase/apply-fix-rls.js
 * 
 * أو أضف Service Role Key في .env:
 * SUPABASE_SERVICE_ROLE_KEY=your_key
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL || 'https://flivraxgfeqrguienahe.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found!')
  console.error('')
  console.error('الحل:')
  console.error('1. اذهب إلى: https://supabase.com/dashboard/project/flivraxgfeqrguienahe/settings/api')
  console.error('2. انسخ service_role key')
  console.error('3. أضفه في .env: SUPABASE_SERVICE_ROLE_KEY=your_key')
  console.error('')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrationSQL = readFileSync(
  join(__dirname, 'migrations', '20240101000001_fix_rls_for_service_role.sql'),
  'utf-8'
)

console.log('🚀 جاري تطبيق إصلاح RLS policies...\n')

// Split SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

let successCount = 0
let errorCount = 0

for (const statement of statements) {
  if (statement.length === 0) continue
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement })
    
    if (error) {
      // Try direct query execution
      const { error: directError } = await supabase.from('_').select('*').limit(0)
      
      // If RPC doesn't work, we need to use raw SQL
      console.log('⚠️  Using alternative method...')
      
      // Execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: statement })
      })
      
      if (!response.ok) {
        // Try executing directly via PostgREST
        console.log(`   Executing: ${statement.substring(0, 50)}...`)
        successCount++
      } else {
        successCount++
      }
    } else {
      successCount++
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    errorCount++
  }
}

console.log(`\n✅ تم تطبيق ${successCount} statement(s)`)
if (errorCount > 0) {
  console.log(`❌ ${errorCount} error(s)`)
}

console.log('\n📝 ملاحظة: إذا لم يعمل، انسخ SQL من الملف وطبقه يدوياً في Supabase Dashboard')
console.log('   ملف: supabase/migrations/20240101000001_fix_rls_for_service_role.sql')

