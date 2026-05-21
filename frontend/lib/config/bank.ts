import type { BankDetails } from '@/types'

/**
 * Bank details are read from environment variables — never hardcoded in source.
 *
 * Required Vercel env vars (Settings → Environment Variables):
 *   NEXT_PUBLIC_BANK_NAME
 *   NEXT_PUBLIC_BANK_ACCOUNT_NUMBER
 *   NEXT_PUBLIC_BANK_ACCOUNT_NAME
 *
 * Permanent fix: implement GET /api/config/bank on the backend.
 * Once that endpoint exists, getBankDetails() will use it automatically
 * and the NEXT_PUBLIC_* vars can be retired.
 */
export const FALLBACK_BANK_DETAILS: BankDetails = {
  bank_name:      process.env.NEXT_PUBLIC_BANK_NAME           ?? '',
  account_number: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? '',
  account_name:   process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME   ?? '',
}

/**
 * Fetch bank details for the checkout payment step.
 *
 * Strategy:
 *   1. Try GET /api/config/bank (backend endpoint — may not exist yet)
 *   2. On any error / 404 → return env-var-backed FALLBACK_BANK_DETAILS silently
 *
 * Safe to call from a client component; never throws.
 */
export async function getBankDetails(): Promise<BankDetails> {
  try {
    const res = await fetch('/api/config/bank', { cache: 'no-store' })
    if (!res.ok) return FALLBACK_BANK_DETAILS
    const body = await res.json()
    if (body?.success && body?.data) return body.data as BankDetails
    return FALLBACK_BANK_DETAILS
  } catch {
    return FALLBACK_BANK_DETAILS
  }
}
