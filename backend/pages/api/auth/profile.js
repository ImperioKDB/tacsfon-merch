import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin }  from '../../../lib/supabase.js'
import { sendSuccess, sendError } from '../../../lib/responseFormatter.js'
import { assertMethod }   from '../../../lib/validate.js'

async function handler(req, res) {
  assertMethod(req, ['GET', 'PATCH'])

  if (req.method === 'GET') {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone, delivery_address, role, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !profile) {
      // Safety-net: If the DB trigger failed during signup, upsert the profile now
      const fallback = {
        id              : req.user.id,
        email           : req.user.email,
        full_name       : req.user.user_metadata?.full_name || 'Member',
        phone           : req.user.user_metadata?.phone     || null,
        delivery_address: null,
        role            : 'student',
        created_at      : new Date().toISOString(),
      }
      await supabaseAdmin.from('profiles').upsert(fallback)
      return sendSuccess(res, fallback)
    }

    return sendSuccess(res, profile)
  }

  if (req.method === 'PATCH') {
    const { full_name, phone, delivery_address } = req.body

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        phone,
        delivery_address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select('id, email, full_name, phone, delivery_address, role, created_at')
      .single()

    if (error) return sendError(res, 'UPDATE_FAILED', 'Failed to update profile.')
    return sendSuccess(res, updated, 'Profile updated successfully.')
  }
}

export default withMiddleware(handler, { requireAuth: true })
