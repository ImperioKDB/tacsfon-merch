/**
 * bank.ts
 * Central bank transfer details for the TACSFON Merch Store.
 * Edit the values below — do NOT rename the export (StepPayment imports BANK_CONFIG).
 */

export const BANK_CONFIG = {
  bankName:      'First Bank of Nigeria',
  accountNumber: '0000000000',          // ← replace with real account number
  accountName:   'TACSFON',             // ← replace with real account name
} as const
