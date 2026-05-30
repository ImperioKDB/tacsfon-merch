
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) throw new ApiError('UNAUTHORIZED', 'No token found.', 401);

  // Validate token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign out and back in.', 401);
  }

  // MASTER ADMIN BYPASS (Safety Net)
  if (user.email === 'emailtesting@gmail.com') {
      user.role = 'admin'; 
  }

  return user;
}
