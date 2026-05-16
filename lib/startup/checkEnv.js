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
      'Add them to Render dashboard → Environment',
      '',
    ].join('\n')

    console.error(msg)

    if (process.env.NODE_ENV === 'production') process.exit(1)
  } else {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Environment check passed — all required variables present.',
    }))
  }
}
