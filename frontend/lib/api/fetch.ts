import { createBrowserClient } from '@/lib/supabase/browser'

// Refresh mutex — ensures only one token refresh runs at a time
let refreshPromise: Promise<any> | null = null

export class ApiError extends Error {
  constructor(
    public readonly code:    string,
    message:                 string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * apiFetch
 *
 * Authenticated fetch wrapper for all backend API calls.
 * Prepends NEXT_PUBLIC_API_URL + /api to every path.
 * Handles 401 → token refresh → retry automatically.
 *
 * Safe to call from both client and server components:
 * the Supabase client is created lazily inside the function
 * so it never runs at module import time on the server.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const url     = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`

  // Build headers — skip auth on server (no session available)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Only attempt session lookup in browser context
  if (typeof window !== 'undefined') {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    } catch {
      // No session — proceed unauthenticated
    }
  }

  const res  = await fetch(url, { ...options, headers })
  const body = await res.json().catch(() => ({}))

  // Handle 401 — refresh token and retry once
  if (res.status === 401 && typeof window !== 'undefined') {
    console.warn('[apiFetch] 401 — refreshing session…')

    if (!refreshPromise) {
      const supabase = createBrowserClient()
      refreshPromise = supabase.auth.refreshSession().finally(() => {
        refreshPromise = null
      })
    }

    const { data: ref } = await refreshPromise

    if (ref.session) {
      console.log('[apiFetch] Token rotated — retrying…')
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${ref.session.access_token}`,
      }
      const retryRes  = await fetch(url, { ...options, headers: retryHeaders })
      const retryBody = await retryRes.json().catch(() => ({}))
      if (retryRes.ok) return (retryBody.data ?? retryBody) as T
      throw new ApiError(
        retryBody?.error?.code    ?? 'RETRY_FAILED',
        retryBody?.error?.message ?? `Retry failed with status ${retryRes.status}`,
        retryRes.status,
      )
    }

    throw new ApiError('SESSION_EXPIRED', 'Session expired. Please sign in again.', 401)
  }

  if (!res.ok) {
    throw new ApiError(
      body?.error?.code    ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
    )
  }

  return (body?.data ?? body) as T
}
