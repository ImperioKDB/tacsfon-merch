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

  // FORCE USE RENDER URL
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}/api${cleanPath}`;

  console.log('📡 Fetching from:', url);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    })
    
    if (res.status === 204) return {} as T;

    const body = (await res.json()) as ApiResponse<T>
    if (!body.success) {
      throw new ApiError(body.error.code, body.error.message, body.error.field, res.status)
    }
    return (body as { success: true; data: T }).data
  } catch (err: any) {
    if (err.name === 'ApiError') throw err;
    console.error('❌ Fetch failed:', err.message);
    throw new ApiError('NETWORK_ERROR', 'The Backend (Render) is not responding. Please wait 30s and try again.')
  }
}
