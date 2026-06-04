/**
 * merch-colors.ts
 *
 * Single source of truth for TACSFON Merch brand colours
 * in TypeScript / JS context (charts, canvas, dynamic styles).
 *
 * For CSS: always use var(--accent), var(--accent-hover), etc.
 * For TS/JS: import from this file — never hardcode hex values.
 *
 * Accent: Boutique Green
 */

export const ACCENT       = '#3DBA6F'
export const ACCENT_HOVER = '#34a863'
export const ACCENT_DIM   = 'rgba(61,186,111,0.12)'

export const BG_BASE     = '#0A0A0A'
export const BG_SURFACE  = '#111111'
export const BG_ELEVATED = '#1A1A1A'

export const TEXT_PRIMARY = '#F5F5F0'
export const TEXT_MUTED   = '#888880'

export const SUCCESS = '#4CAF7D'
export const DANGER  = '#E05252'
export const WARNING = '#C9A84C'   // gold — warning states only
export const INFO    = '#60A5FA'

export const BORDER = 'rgba(255,255,255,0.08)'

/* Admin accent — blue, visually distinct from storefront */
export const ADMIN_ACCENT     = '#5B8CFF'
export const ADMIN_ACCENT_DIM = 'rgba(91,140,255,0.12)'

/* Order status colours */
export const STATUS_COLORS = {
  pending_payment:   '#C9A84C',   // gold — awaiting action
  payment_submitted: '#60A5FA',   // blue  — under review
  confirmed:         '#2DD4BF',   // teal  — verified
  dispatched:        '#C084FC',   // purple
  received:          '#4CAF7D',   // green
  cancelled:         '#E05252',   // red
} as const

export type OrderStatus = keyof typeof STATUS_COLORS
