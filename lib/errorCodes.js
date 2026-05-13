/**
 * Centralised API error codes.
 * Phases 1-5 codes are unchanged above; Phase 6 additions below.
 */
export const ERROR_CODES = {
  // ── Foundation (Phase 1) ─────────────────────────────────────────────────
  INTERNAL_ERROR:         { code: 'INTERNAL_ERROR',         status: 500 },
  NOT_FOUND:              { code: 'NOT_FOUND',               status: 404 },
  FORBIDDEN:              { code: 'FORBIDDEN',               status: 403 },
  UNAUTHORIZED:           { code: 'UNAUTHORIZED',            status: 401 },
  INVALID_INPUT:          { code: 'INVALID_INPUT',           status: 400 },
  DUPLICATE_ENTRY:        { code: 'DUPLICATE_ENTRY',         status: 409 },
  INVALID_REFERENCE:      { code: 'INVALID_REFERENCE',       status: 400 },
  INVALID_VALUE:          { code: 'INVALID_VALUE',           status: 400 },

  // ── Auth (Phase 2) ───────────────────────────────────────────────────────
  SESSION_NOT_FOUND:      { code: 'SESSION_NOT_FOUND',       status: 401 },

  // ── Products (Phase 3) ──────────────────────────────────────────────────
  PRODUCT_NOT_FOUND:      { code: 'PRODUCT_NOT_FOUND',       status: 404 },
  PRODUCT_UNAVAILABLE:    { code: 'PRODUCT_UNAVAILABLE',     status: 400 },

  // ── Cart (Phase 4) ───────────────────────────────────────────────────────
  CART_ITEM_NOT_FOUND:    { code: 'CART_ITEM_NOT_FOUND',     status: 404 },
  INSUFFICIENT_STOCK:     { code: 'INSUFFICIENT_STOCK',      status: 400 },
  VARIANT_NOT_FOUND:      { code: 'VARIANT_NOT_FOUND',       status: 404 },

  // ── Orders (Phase 5) ────────────────────────────────────────────────────
  CART_EMPTY:             { code: 'CART_EMPTY',              status: 400 },
  ORDER_NOT_FOUND:        { code: 'ORDER_NOT_FOUND',         status: 404 },
  INVALID_STATUS_CHANGE:  { code: 'INVALID_STATUS_CHANGE',   status: 400 },

  // ── Payment & Proof Upload (Phase 6) ────────────────────────────────────
  FILE_TOO_LARGE:         { code: 'FILE_TOO_LARGE',          status: 400 },
  INVALID_FILE_TYPE:      { code: 'INVALID_FILE_TYPE',       status: 400 },
  PROOF_ALREADY_UPLOADED: { code: 'PROOF_ALREADY_UPLOADED',  status: 409 },
  PROOF_NOT_FOUND:        { code: 'PROOF_NOT_FOUND',         status: 404 },
  INVALID_PAYMENT_STATUS: { code: 'INVALID_PAYMENT_STATUS',  status: 400 },
  ORDER_NOT_PENDING:      { code: 'ORDER_NOT_PENDING',       status: 400 },
}
