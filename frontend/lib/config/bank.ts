/**
 * lib/config/bank.ts
 *
 * Bank account details used in the checkout Step 2 payment panel.
 *
 * FALLBACK_BANK_DETAILS is the source of truth for now.
 * getBankDetails() tries GET /api/config/bank first so that if the
 * backend engineer adds that endpoint later it takes over automatically
 * without any frontend change.
 */

import type { BankDetails } from '@/types'

/** Hardcoded fallback — always works even without the backend endpoint. */
export const FALLBACK_BANK_DETAILS: BankDetails = {
  bank_name:      'Opay',
  account_number: '8145355705',
  account_name:   'Divine Momoh',
}

/**
 * Fetch bank details for the checkout payment step.
 *
 * Strategy:
 *   1. Try GET /api/config/bank (backend endpoint, may not exist yet)
 *   2. On any error / 404 → return FALLBACK_BANK_DETAILS silently
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