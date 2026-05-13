import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required env vars at startup — app refuses to run if any are missing
if (!supabaseUrl) throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is not set')
if (!supabaseAnonKey) throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
if (!supabaseServiceRoleKey) throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set')

/**
 * Anon client — respects Row Level Security (RLS)
 * Use for user-facing reads where RLS should apply.
 */
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Admin (service-role) client — bypasses RLS entirely
 * Use ONLY for backend operations where you control the auth checks yourself.
 * NEVER expose this client or its key to frontend / client-side code.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
