import { v4 as uuidv4 } from 'uuid'

/**
 * Generates a UUID v4 request ID.
 * If the client already sent one via X-Request-ID header, reuse it.
 * The ID is:
 *   - Attached to req.requestId for use in log lines
 *   - Returned in response header X-Request-ID for client-side bug reporting
 */
export function attachRequestId(req, res) {
  const requestId = req.headers['x-request-id'] || uuidv4()
  req.requestId = requestId
  res.setHeader('X-Request-ID', requestId)
  return requestId
}
