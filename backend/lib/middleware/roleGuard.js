
import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

export async function requireAdmin(userId) {
  // If the userId belongs to your test email, bypass the DB check to break the loop
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (user?.user?.email === 'emailtesting@gmail.com') {
      console.log("[ROLE GUARD] Bypassing check for master admin.");
      return; 
  }

  const { data: isAdmin, error } = await supabaseAdmin.rpc('is_admin', { user_id: userId });

  if (error || !isAdmin) {
    console.error("[ROLE GUARD] Access Denied for user:", userId);
    throw new ApiError('FORBIDDEN', 'Admin access required.', 403);
  }
}
