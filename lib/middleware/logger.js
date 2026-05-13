/**
 * Structured JSON logger.
 * Every log line is a JSON object — never raw strings.
 *
 * Log format:
 * {
 *   timestamp, level, requestId, userId, method, path, message, ...extra
 * }
 */

/**
 * Log the incoming request (called once at the start of every request).
 */
export function logRequest(req) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    requestId: req.requestId,
    method: req.method,
    path: req.url,
    message: 'Incoming request',
  }))
}

/**
 * Log the outgoing response (attach to res.end if needed).
 */
export function logResponse(req, statusCode) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
    requestId: req.requestId,
    userId: req.user?.id || null,
    method: req.method,
    path: req.url,
    statusCode,
    message: 'Request completed',
  }))
}

/**
 * Create a scoped logger bound to a specific request.
 * Use inside route handlers for contextual logging.
 *
 * Example:
 *   const log = createLogger(req)
 *   log.info('Cart cleared', { cartId })
 */
export function createLogger(req) {
  const base = {
    requestId: req.requestId || 'unknown',
    userId: req.user?.id || null,
    method: req.method,
    path: req.url,
  }

  const write = (level, message, extra = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      ...base,
      message,
      ...extra,
    }))
  }

  return {
    info:  (msg, extra) => write('info', msg, extra),
    warn:  (msg, extra) => write('warn', msg, extra),
    error: (msg, extra) => write('error', msg, extra),
  }
}
