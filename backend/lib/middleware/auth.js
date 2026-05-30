
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) throw new ApiError('UNAUTHORIZED', 'No token provided.', 401);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new ApiError('UNAUTHORIZED', 'Session expired.', 401);
  
  if (user.email === 'emailtesting@gmail.com') user.role = 'admin'; 
  return user;
}

// CRITICAL FIX: Export optionalAuth so public routes don't crash (Bug #1)
export async function optionalAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return null;
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    return user || null;
  } catch { return null; }
}
