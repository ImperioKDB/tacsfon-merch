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

/**
 * resolveColor
 *
 * Maps a variant colour name (e.g. "Red", "Navy", "White") to a CSS hex
 * for rendering swatches in VariantSelector.
 * Falls back to a neutral grey for unknown colour names.
 */
const COLOR_MAP: Record<string, string> = {
  // Basics
  black:       '#0A0A0A',
  white:       '#F5F5F0',
  grey:        '#888880',
  gray:        '#888880',
  silver:      '#C0C0C0',

  // Reds / pinks
  red:         '#E05252',
  crimson:     '#DC143C',
  maroon:      '#800000',
  pink:        '#F472B6',
  rose:        '#FB7185',

  // Blues
  blue:        '#3B82F6',
  navy:        '#1E3A5F',
  cobalt:      '#0047AB',
  royal:       '#4169E1',
  sky:         '#7DD3FC',
  teal:        '#2DD4BF',
  cyan:        '#22D3EE',

  // Greens
  green:       '#3DBA6F',
  olive:       '#6B7C3F',
  lime:        '#84CC16',
  forest:      '#228B22',
  mint:        '#98FF98',

  // Yellows / oranges
  yellow:      '#FBBF24',
  gold:        '#C9A84C',
  orange:      '#F97316',
  amber:       '#F59E0B',

  // Purples / browns
  purple:      '#C084FC',
  violet:      '#7C3AED',
  lavender:    '#C4B5FD',
  brown:       '#92400E',
  tan:         '#D2B48C',
  beige:       '#F5F0DC',
}

export function resolveColor(colorName: string): string {
  if (!colorName) return '#444440'
  const key = colorName.trim().toLowerCase()
  return COLOR_MAP[key] ?? '#444440'
}
