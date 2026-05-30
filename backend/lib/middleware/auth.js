
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) throw new ApiError('UNAUTHORIZED', 'Authentication required.', 401);

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    // AUDIT #6: Hide internal Supabase error messages from client
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign in again.', 401);
  }

  return user;
}
