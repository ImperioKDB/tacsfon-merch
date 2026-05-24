import type { ApiResponse } from '@/types'

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    const body = await res.json() as ApiResponse<T>;
    
    if (!res.ok || !body.success) {
      throw new ApiError(body.error?.code || 'ERROR', body.error?.message || 'Request failed', res.status);
    }
    return body.data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', 'Backend unreachable. Wake up Render by refreshing.');
  }
}
