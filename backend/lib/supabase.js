
import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!rawUrl) throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing')

// CLEAN THE URL: Strip trailing slashes to prevent HTML 404 errors
const supabaseUrl = rawUrl.replace(/\/$/, '');

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
