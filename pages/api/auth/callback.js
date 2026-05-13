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
 *
 * Note: Supabase also supports a PKCE flow where the code exchange happens
 * client-side. This server-side handler is for SSR/cookie-based auth.
 * If your frontend uses the client-side Supabase SDK for the full flow,
 * this route still acts as the redirect landing page.
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

  // Exchange the code for a session via the admin client
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

  // Set auth cookies so SSR pages can read the session server-side
  // Secure flag only in production; HttpOnly so JS can't read the token
  const isProd = process.env.NODE_ENV === 'production'
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`

  res.setHeader('Set-Cookie', [
    `sb-access-token=${access_token}; ${cookieFlags}; Max-Age=3600`,
    `sb-refresh-token=${refresh_token}; ${cookieFlags}; Max-Age=604800`,
  ])

  // Ensure the user has a profile row (new OAuth users may not have one yet)
  // The DB trigger should handle this, but we upsert here as a safety net.
  await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || null,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        role: 'student', // default role; admins are upgraded manually
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .catch((err) => {
      // Non-fatal — log and continue
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        requestId: req.requestId,
        userId: data.user.id,
        message: 'Profile upsert failed after OAuth',
        error: err.message,
      }))
    })

  // Success — redirect to home
  return res.redirect(`${appUrl}/`)
}

// No auth middleware needed — this is the endpoint that creates the session
export default withMiddleware(handler)
