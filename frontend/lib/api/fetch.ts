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

  // Bug 4 Fix: Add 20-second timeout for Render Cold Start
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); 

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { 
      ...options, 
      headers, 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
       throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }

    const body = await res.json();
    if (!res.ok || body.success === false) {
      throw new ApiError(body.error?.code || 'ERROR', body.error?.message || 'Request failed', res.status);
    }
    return body.data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error("The server is taking a moment to wake up. Please refresh in 30 seconds.");
    }
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
