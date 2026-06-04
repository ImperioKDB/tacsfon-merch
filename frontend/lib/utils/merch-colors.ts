/**
 * merch-colors.ts
 *
 * Single source of truth for TACSFON Merch brand colours in TS/JS contexts.
 * For CSS: always use var(--accent), var(--accent-hover), etc.
 * For TS/JS: import from here — never hardcode hex in components.
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
export const WARNING = '#C9A84C'
export const INFO    = '#60A5FA'

export const BORDER = 'rgba(255,255,255,0.08)'

export const ADMIN_ACCENT     = '#5B8CFF'
export const ADMIN_ACCENT_DIM = 'rgba(91,140,255,0.12)'

export const STATUS_COLORS = {
  pending_payment:   '#C9A84C',
  payment_submitted: '#60A5FA',
  confirmed:         '#2DD4BF',
  dispatched:        '#C084FC',
  received:          '#4CAF7D',
  cancelled:         '#E05252',
} as const

export type OrderStatus = keyof typeof STATUS_COLORS
