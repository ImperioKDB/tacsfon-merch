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

  // This controller gives the server 25 seconds to wake up (Render's max boot time)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); 

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.status === 401) {
       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?next=' + window.location.pathname;
       }
       throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }

    const body = await res.json();
    if (!res.ok || body.success === false) {
      throw new ApiError(body.error?.code || 'ERROR', body.error?.message || 'Request failed', res.status);
    }
    return body.data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error("System is warming up. Please wait 10 seconds and refresh.");
    }
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
