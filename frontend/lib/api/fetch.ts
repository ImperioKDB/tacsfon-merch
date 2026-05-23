import type { ApiResponse } from '@/types'

/**
 * Typed API error. Thrown by apiFetch on any non-success response.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly field?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Central fetch utility for all /api/* calls.
 * - Attaches auth token from Supabase session automatically
 * - Parses the standard { success, data, error } envelope
 * - Throws ApiError on failure — never returns raw error objects
 * - Accepts AbortSignal for cancellable requests
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { createBrowserClient } = await import('@/lib/supabase/browser')
  const supabase = createBrowserClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  let res: Response
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  try {
    res = await fetch(`${baseUrl}/api${path}`, { ...options, headers })
  } catch {

  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Connection issue. Please check your internet and try again.',
    )
  }

  let body: ApiResponse<T>
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    throw new ApiError(
      'PARSE_ERROR',
      'Unexpected response from server. Please try again.',
      undefined,
      res.status,
    )
  }

  if (!body.success) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      body.error.field,
      res.status,
    )
  }

  return (body as { success: true; data: T }).data
}