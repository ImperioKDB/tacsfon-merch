import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // AUTO-ATTACH ID CARD
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const body = await res.json();
    
    if (!res.ok || body.success === false) {
      throw new ApiError(
        body.error?.code || 'ERROR', 
        body.error?.message || 'Request failed', 
        res.status
      );
    }
    return body.data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
