import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * GET /api/auth/callback
 *
 * Handles the Google OAuth redirect after Supabase completes the token exchange.
 *
 * Flow:
 *   1. User clicks "Sign in with Google" on the frontend
 *   2. Frontend calls supabase.auth.signInWithOAuth({ provider: 'google',
 *        options: { redirectTo: '{APP_URL}/api/auth/callback' } })
 *   3. Supabase handles the Google OAuth exchange
 *   4. Supabase redirects here with `code` query param
 *   5. This route exchanges the code for a session
 *   6. On success → redirect to /
 *   7. On failure → redirect to /login?error=oauth_failed
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  const { code, error: oauthError } = req.query
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Google cancelled or returned an error
  if (oauthError) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      requestId: req.requestId,
      message: 'OAuth callback received error from provider',
      oauthError,
    }))
    return res.redirect(`${appUrl}/login?error=oauth_cancelled`)
  }

  // No code — malformed callback URL
  if (!code) {
    return res.redirect(`${appUrl}/login?error=oauth_failed`)
  }

  // Exchange the code for a session
  const { data, error: exchangeError } = await supabaseAdmin.auth.exchangeCodeForSession(code)

  if (exchangeError || !data?.session) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      requestId: req.requestId,
      message: 'OAuth code exchange failed',
      error: exchangeError?.message || 'No session returned',
    }))
    return res.redirect(`${appUrl}/login?error=oauth_failed`)
  }

  const { access_token, refresh_token } = data.session

  // Set auth cookies for SSR pages
  const isProd = process.env.NODE_ENV === 'production'
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`

  res.setHeader('Set-Cookie', [
    `sb-access-token=${access_token}; ${cookieFlags}; Max-Age=3600`,
    `sb-refresh-token=${refresh_token}; ${cookieFlags}; Max-Age=604800`,
  ])

  // Safety-net profile upsert for new OAuth users
  // (DB trigger handles this, but we upsert here as a fallback)
  // FIX: removed avatar_url — column does not exist in profiles table
  await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id:        data.user.id,
        email:     data.user.email,
        full_name: data.user.user_metadata?.full_name || null,
        role:      'student',   // default; admins are upgraded manually
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .catch((err) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        requestId: req.requestId,
        userId: data.user.id,
        message: 'Profile upsert failed after OAuth',
        error: err.message,
      }))
    })

  return res.redirect(`${appUrl}/`)
}

// No auth middleware — this endpoint creates the session
export default withMiddleware(handler)
