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
  
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
       console.warn("Session error. Attempting forced token refresh...");
       const { data: ref } = await supabase.auth.refreshSession();
       
       if (ref.session) {
          const retryHeaders = { ...headers, 'Authorization': `Bearer ${ref.session.access_token}` };
          const retryRes = await fetch(url, { ...options, headers: retryHeaders });
          const retryBody = await retryRes.json();
          if (retryRes.ok) return retryBody.data;
       }
       
       if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?next=' + window.location.pathname;
       }
       throw new ApiError("UNAUTHORIZED", "Please sign in.", 401);
    }

    const body = await res.json();
    if (!res.ok) throw new ApiError(body.error?.code || 'ERR', body.error?.message || 'Fail', res.status);
    return body.data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || "Network Error");
  }
}
