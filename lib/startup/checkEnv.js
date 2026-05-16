/**
 * lib/startup/checkEnv.js
 *
 * Validates that all required environment variables are present at startup.
 * Call this once from pages/_app.js (server-side) or a custom server entry.
 *
 * The app refuses to start and throws a clear error if any variable is missing,
 * rather than failing silently mid-request with a cryptic error.
 */

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ADMIN_CHAT_ID_1',
  'TELEGRAM_ADMIN_CHAT_ID_2',
]

let checked = false

export function checkEnv() {
  // Only run once per process — not on every request
  if (checked) return
  checked = true

  const missing = REQUIRED_VARS.filter(key => !process.env[key])

  if (missing.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════╗',
      '║   TACSFON Merch — Missing Environment Vars   ║',
      '╚══════════════════════════════════════════════╝',
      '',
      'The following required environment variables are not set:',
      ...missing.map(key => `  ✗  ${key}`),
      '',
      'Add them to your Render dashboard → Environment',
      'or to .env.local for local development.',
      '',
    ].join('\n')

    console.error(msg)

    // In production: crash immediately so Render shows a clear failure
    // In development: warn but continue (allows partial local dev)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  } else {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Environment check passed — all required variables present.',
    }))
  }
}
