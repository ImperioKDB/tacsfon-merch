/**
 * Maps product variant colour names to hex values for the 3D viewers.
 * Add new colours here as TACSFON introduces them — no viewer code changes needed.
 */
export const MERCH_COLORS: Record<string, string> = {
  maroon:    '#7B1A2E',
  burgundy:  '#7B1A2E',
  black:     '#1C1C1C',
  white:     '#F0EDE8',
  navy:      '#1B2A4A',
  red:       '#C0392B',
  green:     '#1A4A2A',
  gold:      '#3DBA6F',
  grey:      '#555555',
  gray:      '#555555',
  brown:     '#5C3317',
  purple:    '#4A1A7B',
  blue:      '#1A3A7B',
  orange:    '#C0601A',
  pink:      '#C0507A',
}

/**
 * Resolve a colour name or raw hex into a hex string.
 * Falls back to black if unrecognised.
 */
export function resolveColor(name: string | null | undefined): string {
  if (!name) return '#1C1C1C'
  const lower = name.toLowerCase().trim()
  return MERCH_COLORS[lower] ?? (lower.startsWith('#') ? lower : '#1C1C1C')
}