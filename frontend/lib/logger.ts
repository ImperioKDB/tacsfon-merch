/**
 * logger — Structured JSON production logger
 *
 * Every log line is a JSON object on a single line.
 * Structured logs are compatible with Vercel Log Drains, Datadog, Logtail, etc.
 *
 * Shape:
 * {
 *   "timestamp":  "2025-01-01T12:00:00.000Z",
 *   "level":      "info" | "warn" | "error",
 *   "requestId":  "uuid or null",
 *   "userId":     "uuid or null",
 *   "path":       "/api/orders",
 *   "method":     "POST",
 *   "statusCode": 201,
 *   "message":    "Order created successfully",
 *   "error":      "optional — raw error string, never a stack trace in prod"
 * }
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *
 *   logger.info({ requestId, userId, path, method, statusCode: 201 }, 'Order created')
 *   logger.warn({ requestId }, 'Payment proof missing after 10 min')
 *   logger.error({ requestId, error: err.message, path, method }, 'DB insert failed')
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NEVER LOG:
 *   • Passwords or password hashes
 *   • Full JWT tokens (log userId extracted FROM the token, not the token itself)
 *   • Bank account numbers or names
 *   • Payment proof file contents or binary data
 *   • Full request/response bodies on sensitive endpoints (auth, payment)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Types ────────────────────────────────────────────────────────────────────

type Level = 'info' | 'warn' | 'error'

export interface LogContext {
  requestId?:  string | null
  userId?:     string | null
  path?:       string | null
  method?:     string | null
  statusCode?: number | null
  error?:      string | null
  // Allow arbitrary extra fields (e.g. orderId, variantId, action)
  [key: string]: unknown
}

// Keys that are always written at the top level in the known order
const RESERVED = new Set(['requestId', 'userId', 'path', 'method', 'statusCode', 'error'])

// ── Core write ───────────────────────────────────────────────────────────────

function write(level: Level, ctx: LogContext, message: string): void {
  const isProd = process.env.NODE_ENV === 'production'

  // Collect any extra context fields (e.g. orderId, action, etc.)
  const extras = Object.fromEntries(
    Object.entries(ctx).filter(([k]) => !RESERVED.has(k))
  )

  const line: Record<string, unknown> = {
    timestamp:  new Date().toISOString(),
    level,
    requestId:  ctx.requestId  ?? null,
    userId:     ctx.userId     ?? null,
    path:       ctx.path       ?? null,
    method:     ctx.method     ?? null,
    statusCode: ctx.statusCode ?? null,
    message,
  }

  // Only include the error field when it's present
  if (ctx.error) {
    // In production, never include raw stack traces — strip them
    line.error = isProd
      ? String(ctx.error).split('\n')[0]   // first line only
      : ctx.error
  }

  // Merge extra fields last
  Object.assign(line, extras)

  const output = JSON.stringify(line)

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

// ── Public logger ────────────────────────────────────────────────────────────

export const logger = {
  /**
   * Log an informational event (successful operations, lifecycle events).
   */
  info(ctx: LogContext, message: string): void {
    write('info', ctx, message)
  },

  /**
   * Log a recoverable warning (e.g. Telegram failed but order still created).
   */
  warn(ctx: LogContext, message: string): void {
    write('warn', ctx, message)
  },

  /**
   * Log an error (DB failures, unexpected exceptions, payment errors).
   * Pass the error message in ctx.error — NEVER the full Error object in prod.
   */
  error(ctx: LogContext, message: string): void {
    write('error', ctx, message)
  },
}
