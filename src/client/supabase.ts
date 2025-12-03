import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a properly typed Supabase client
// Use a placeholder if env vars are missing (for development)
const createSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    console.error('❌ Missing Supabase environment variables!')
    console.error('Please create a .env file in the root directory with:')
    console.error('VITE_SUPABASE_URL=https://your-project.supabase.co')
    console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here')
    console.error('')
    console.error('Get these values from: https://supabase.com/dashboard → Your Project → Settings → API')

    // Create a dummy client to prevent crashes, but it will fail on actual requests
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key')
  } else {
    // Validate URL format
    if (!supabaseUrl.startsWith('http')) {
      console.error('❌ Invalid Supabase URL. Must start with http:// or https://')
    }

    // Validate key format (should start with eyJ for JWT)
    if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
      console.warn('⚠️ Warning: Anon key format looks incorrect. Make sure you copied the "anon/public" key, not "service_role" key.')
    }

    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    console.log('✅ Supabase client initialized')
    console.log('📍 URL:', supabaseUrl)
    console.log('🔑 Key length:', supabaseAnonKey.length, 'characters')
    
    return client
  }
}

export const supabase = createSupabaseClient()
