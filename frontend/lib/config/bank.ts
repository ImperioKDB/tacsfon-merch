/**
 * bank.ts
 *
 * Bank transfer details shown on the checkout payment step.
 * Values are injected at BUILD TIME by Next.js from Vercel environment vars.
 *
 * ⚠️  NEXT_PUBLIC_* vars MUST be set in Vercel before the build runs.
 *    Runtime-only env vars are NOT available to client components.
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   NEXT_PUBLIC_BANK_NAME        e.g. "Opay"
 *   NEXT_PUBLIC_ACCOUNT_NUMBER   e.g. "8012345678"
 *   NEXT_PUBLIC_ACCOUNT_NAME     e.g. "TACSFON"
 *
 * After adding / changing these vars you MUST trigger a new Vercel deployment
 * (they are baked in at build time, not read at runtime).
 */

export const BANK_CONFIG = {
  bankName:      process.env.NEXT_PUBLIC_BANK_NAME      ?? 'SET_NEXT_PUBLIC_BANK_NAME',
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER ?? 'SET_NEXT_PUBLIC_ACCOUNT_NUMBER',
  accountName:   process.env.NEXT_PUBLIC_ACCOUNT_NAME   ?? 'SET_NEXT_PUBLIC_ACCOUNT_NAME',
} as const
