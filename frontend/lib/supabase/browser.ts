import { createBrowserClient as _create } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton — one client per browser session.
let _client: SupabaseClient | null = null

export function createBrowserClient(): SupabaseClient {
  if (_client) return _client
  _client = _create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return _client
}