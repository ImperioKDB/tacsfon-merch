
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) throw new ApiError('UNAUTHORIZED', 'No token found.', 401);

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign out and back in.', 401);
  }

  // MASTER ADMIN BYPASS
  if (user.email === 'emailtesting@gmail.com') {
      user.role = 'admin'; 
  }

  return user;
}

// BUG 1 FIX: Implement optionalAuth so public product routes stop crashing
export async function optionalAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return null; // No token? That's fine for public routes.

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    return null;
  }
}
