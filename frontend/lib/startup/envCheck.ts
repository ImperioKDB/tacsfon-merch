/**
 * envCheck — Startup environment variable validator
 *
 * Validates that every required env var is present before the app starts.
 * - In production:   throws a hard error → Vercel marks the deployment failed
 * - In development:  console.error only → lets you iterate without full config
 *
 * Optional variables emit a console.warn; the app still starts.
 *
 * Call once, server-side only:
 *
 *   // app/layout.tsx  (or middleware.ts)
 *   import { checkEnv } from '@/lib/startup/envCheck'
 *   checkEnv()
 *
 * NEVER log the actual values — only the variable names.
 */

// ── Variable lists ───────────────────────────────────────────────────────────

interface EnvVar {
  key:         string
  description: string
}

const REQUIRED: EnvVar[] = [
  // Supabase
  { key: 'NEXT_PUBLIC_SUPABASE_URL',      description: 'Supabase project URL'             },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anon (public) key'       },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',     description: 'Supabase service-role key (secret)' },

  // App
  { key: 'NEXT_PUBLIC_APP_URL',           description: 'Deployed app URL (e.g. https://tacsfon-merch.vercel.app)' },

  // Telegram
  { key: 'TELEGRAM_BOT_TOKEN',            description: 'Telegram bot token'               },
  { key: 'TELEGRAM_ADMIN_CHAT_ID_1',      description: 'Primary admin Telegram chat ID'   },

  // Bank
  { key: 'BANK_NAME',                     description: 'Bank name for payment instructions' },
  { key: 'BANK_ACCOUNT_NUMBER',           description: 'Bank account number'               },
  { key: 'BANK_ACCOUNT_NAME',             description: 'Bank account name'                 },
]

const OPTIONAL: EnvVar[] = [
  { key: 'TELEGRAM_ADMIN_CHAT_ID_2', description: 'Secondary admin Telegram chat ID' },
  { key: 'GOOGLE_CLIENT_ID',         description: 'Google OAuth client ID'           },
  { key: 'GOOGLE_CLIENT_SECRET',     description: 'Google OAuth client secret'       },
]

// ── Validation ───────────────────────────────────────────────────────────────

function isMissing(key: string): boolean {
  const value = process.env[key]
  return !value || value.trim() === ''
}

/**
 * Run environment variable validation.
 *
 * Call this once at application startup (server-side only).
 * Safe to call multiple times — idempotent.
 */
export function checkEnv(): void {
  // Server-side only — do nothing in the browser
  if (typeof window !== 'undefined') return

  const isProd = process.env.NODE_ENV === 'production'

  const missingRequired = REQUIRED.filter(v => isMissing(v.key))
  const missingOptional = OPTIONAL.filter(v => isMissing(v.key))

  // Optional — warn but allow startup
  if (missingOptional.length > 0) {
    const lines = missingOptional.map(v => `  • ${v.key} — ${v.description}`)
    console.warn(
      '[TACSFON] ⚠️  Optional env vars not set (some features may not work):\n' +
      lines.join('\n')
    )
  }

  // Required — hard fail in production
  if (missingRequired.length > 0) {
    const lines = missingRequired.map(v => `  • ${v.key} — ${v.description}`)
    const message =
      '[TACSFON] ❌ Missing required environment variables:\n' +
      lines.join('\n') + '\n' +
      '  Add these to .env.local (development) or your Vercel/Render dashboard (production).'

    if (isProd) {
      throw new Error(message)   // Prevents the app from serving traffic
    } else {
      console.error(message)
    }

    return
  }

  console.log('[TACSFON] ✅ All required environment variables are present.')
}
