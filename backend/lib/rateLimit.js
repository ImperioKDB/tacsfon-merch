
import { ApiError } from './errorHandler.js'
const store = new Map();
const WINDOW_MS = 60_000;
const LIMITS = { auth: 5, cart: 30, order: 3, upload: 10, admin: 60 };

export function checkRateLimit(key, bucket) {
  const limit = LIMITS[bucket];
  if (!limit) return;
  const storeKey = `${bucket}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(storeKey, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= limit) throw new ApiError('RATE_LIMIT_EXCEEDED', 'Slow down.', 429);
  entry.count++;
}

export function getClientIp(req) {
  // AUDIT #8: Stop trusting spoofable headers. Use socket address.
  return req.socket?.remoteAddress || 'unknown';
}
