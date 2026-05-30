import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
       // Deep Refresh Strategy:
       // If the backend rejects the token, we force a session refresh in the browser
       const { data: refresh, error: refreshErr } = await supabase.auth.refreshSession();
       
       if (refreshErr || !refresh.session) {
          window.location.href = '/login?next=' + window.location.pathname;
          throw new ApiError("UNAUTHORIZED", "Session lost. Please log in again.", 401);
       }
       
       // Success! We have a new token. Let's try the request ONE more time automatically.
       const retryHeaders = { ...headers, 'Authorization': `Bearer ${refresh.session.access_token}` };
       const retryRes = await fetch(url, { ...options, headers: retryHeaders });
       const retryBody = await retryRes.json();
       
       if (!retryRes.ok) throw new ApiError("RETRY_FAILED", "Identity refreshed, but access still denied.", 403);
       return retryBody.data;
    }

    const body = await res.json();
    if (!res.ok) throw new ApiError(body.error?.code || 'ERR', body.error?.message || 'Fail', res.status);
    return body.data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
