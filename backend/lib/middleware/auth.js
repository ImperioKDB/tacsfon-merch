
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    console.error("[AUTH DEBUG] No token found in headers.");
    throw new ApiError('UNAUTHORIZED', 'Authentication required.', 401);
  }

  // Validate token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    // This logs to Render, helping us find the mismatch
    console.error("[AUTH DEBUG] Supabase Rejection:", error?.message || "User missing");
    console.error("[AUTH DEBUG] Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign in again.', 401);
  }

  return user;
}
