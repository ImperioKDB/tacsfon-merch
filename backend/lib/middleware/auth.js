
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    throw new ApiError('UNAUTHORIZED', 'No token provided in headers.', 401)
  }

  // Use getUser instead of checking the DB directly to verify the JWT session
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    console.error("Supabase Auth Rejection:", error?.message);
    throw new ApiError('UNAUTHORIZED', `Token rejected by Auth Provider: ${error?.message || 'Unknown'}`, 401)
  }

  return user
}

export async function optionalAuth(req) {
  try { return await validateAuth(req) } catch { return null }
}
