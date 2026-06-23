/**
 * envCheck — Startup environment variable validator
 *
 * Validates that every required env var is present before the app starts.
 * - In production:  throws a hard error → Vercel marks the deployment failed
 * - In development: console.error only → lets you iterate without full config
 *
 * Call once, server-side only, from app/layout.tsx or middleware.ts.
 * NEVER log the actual values — only the variable names.
 */

interface EnvVar {
  key:         string
  description: string
}

const REQUIRED: EnvVar[] = [
  // Supabase (public keys only — service role key lives on the backend/Render)
  { key: 'NEXT_PUBLIC_SUPABASE_URL',      description: 'Supabase project URL'             },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anon (public) key'       },

  // App
  { key: 'NEXT_PUBLIC_APP_URL',           description: 'Deployed app URL (e.g. https://tacsfon-merch.vercel.app)' },
  { key: 'NEXT_PUBLIC_API_URL',           description: 'Backend API URL (Render service)'  },

  // Bank — MUST match exactly what bank.ts reads (baked in at build time)
  { key: 'NEXT_PUBLIC_BANK_NAME',         description: 'Bank name shown on checkout page'  },
  { key: 'NEXT_PUBLIC_ACCOUNT_NUMBER',    description: 'Account number shown on checkout'  },
  { key: 'NEXT_PUBLIC_ACCOUNT_NAME',      description: 'Account name shown on checkout'    },
]

const OPTIONAL: EnvVar[] = [
  { key: 'NEXT_PUBLIC_WHATSAPP_NUMBER',  description: 'WhatsApp contact number (contact page)' },
]

function isMissing(key: string): boolean {
  const value = process.env[key]
  return !value || value.trim() === ''
}

let _checked = false

export function checkEnv(): void {
  if (typeof window !== 'undefined') return   // browser — nothing to check
  if (_checked) return                         // idempotent
  _checked = true

  const isProd = process.env.NODE_ENV === 'production'

  const missingRequired = REQUIRED.filter(v => isMissing(v.key))
  const missingOptional = OPTIONAL.filter(v => isMissing(v.key))

  if (missingOptional.length > 0) {
    const lines = missingOptional.map(v => `  • ${v.key} — ${v.description}`)
    console.warn(
      '[TACSFON] ⚠️  Optional env vars not set (some features may not work):\n' +
      lines.join('\n')
    )
  }

  if (missingRequired.length > 0) {
    const lines = missingRequired.map(v => `  • ${v.key} — ${v.description}`)
    const message =
      '[TACSFON] ❌ Missing required environment variables:\n' +
      lines.join('\n') + '\n' +
      '  Add these to .env.local (dev) or Vercel → Settings → Environment Variables (prod).\n' +
      '  NOTE: NEXT_PUBLIC_* vars are baked in at BUILD TIME — redeploy after changing them.'

    if (isProd) {
      throw new Error(message)
    } else {
      console.error(message)
    }
    return
  }

  console.log('[TACSFON] ✅ All required environment variables are present.')
}
