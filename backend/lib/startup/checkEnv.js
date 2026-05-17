/**
 * lib/startup/checkEnv.js
 *
 * Validates that all required environment variables are present at startup.
 *
 * IMPORTANT: Next.js runs _app.js during `next build` as well as at runtime.
 * We skip the hard exit during build (NEXT_PHASE === 'phase-production-build')
 * so the build succeeds even when Telegram vars aren't in the build environment.
 * The check still runs and crashes at actual server startup if vars are missing.
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
  if (checked) return
  checked = true

  // Skip hard exit during `next build` — vars only need to be present at runtime
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

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
      isBuildPhase
        ? 'Running during build — skipping exit. Ensure vars are set before server start.'
        : 'Add them to Render dashboard → Environment',
      '',
    ].join('\n')

    console.error(msg)

    // Only crash in production at RUNTIME — not during build
    if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
      process.exit(1)
    }

  } else {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level:     'info',
      message:   'Environment check passed — all required variables present.',
    }))
  }
}
