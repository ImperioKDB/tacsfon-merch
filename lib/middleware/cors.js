/**
 * CORS middleware.
 * In production: only allows requests from NEXT_PUBLIC_APP_URL.
 * In development: allows localhost:3000 and localhost:3001.
 *
 * Returns true if the request was an OPTIONS preflight (response already sent).
 * Returns false if the request should continue to the route handler.
 */

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? [process.env.NEXT_PUBLIC_APP_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001']

export function applyCors(req, res) {
  const origin = req.headers.origin

  // Only set Allow-Origin if the origin is in the allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-ID'
  )
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID')
  res.setHeader('Vary', 'Origin')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true // Response sent — stop middleware chain
  }

  return false // Continue to route handler
}
