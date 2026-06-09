/**
 * bank.ts
 *
 * Bank transfer details for the TACSFON Merch Store.
 * Values are read from Vercel environment variables so they never
 * need to be committed to source code.
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   NEXT_PUBLIC_BANK_NAME       = "First Bank of Nigeria"
 *   NEXT_PUBLIC_ACCOUNT_NUMBER  = "3012345678"
 *   NEXT_PUBLIC_ACCOUNT_NAME    = "TACSFON UNIBEN"
 */

export const BANK_CONFIG = {
  bankName:      process.env.NEXT_PUBLIC_BANK_NAME       ?? 'First Bank of Nigeria',
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER  ?? '0000000000',
  accountName:   process.env.NEXT_PUBLIC_ACCOUNT_NAME    ?? 'TACSFON',
} as const
