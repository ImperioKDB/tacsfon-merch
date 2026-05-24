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
 * Connects Frontend (Vercel) to Backend (Render).
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

  // Use the Render Backend URL from Environment Variables
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  let res: Response;
  try {
    // Combine baseUrl + /api + path (e.g., https://api.render.com/api/products)
    console.log('Attempting fetch to:', `${baseUrl}/api${path}`); res = await fetch(`${baseUrl}/api${path}`, { ...options, headers })
  } catch (err) {
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
