import type { ApiResponse } from '@/types'

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly field?: string, public readonly status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { createBrowserClient } = await import('@/lib/supabase/browser')
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // 'credentials: include' allows the browser to send/receive cookies across domains (Vercel <-> Render)
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors'
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api${path}`, config)
  } catch (err) {
    console.error('Fetch Error:', err);
    throw new ApiError('NETWORK_ERROR', 'Cannot reach backend. Check if Render is awake.')
  }

  const body = (await res.json()) as ApiResponse<T>
  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message, body.error.field, res.status)
  }
  return (body as { success: true; data: T }).data
}
