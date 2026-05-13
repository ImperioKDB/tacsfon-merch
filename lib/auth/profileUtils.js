import { supabaseAdmin } from '../supabase.js'

/**
 * Fetches a user's full profile from the `profiles` table.
 * Uses the service-role client so it works regardless of RLS.
 *
 * Returns null if the profile doesn't exist.
 *
 * @param {string} userId - Supabase auth user ID (UUID)
 * @returns {Promise<object|null>}
 */
export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

/**
 * Checks if a user has the 'admin' role.
 * Always reads from DB — never trusts JWT claims.
 *
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return data.role === 'admin'
}
