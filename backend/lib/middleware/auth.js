
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function validateAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) throw new ApiError('UNAUTHORIZED', 'No token found.', 401);

  // AUDIT LOG: Let's see what project Render thinks it's using
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING";
  console.log(`[AUTH CHECK] Using Project: ${url.substring(0, 12)}...`);

  // Verify token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.error("[AUTH FAIL] Supabase rejected token:", error?.message);
    throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign out and back in.', 401);
  }

  // FORCE ADMIN CHECK: If the database says student but it's YOU, fix it
  if (user.email === 'emailtesting@gmail.com') {
      user.role = 'admin'; 
      console.log("[AUTH SUCCESS] Admin override granted for emailtesting.");
  }

  return user;
}
