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

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); 

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    // Detect if we hit a HTML error page (Render/Supabase 404)
    const type = res.headers.get("content-type");
    if (type && type.includes("text/html")) {
        throw new ApiError("BACKEND_OFFLINE", "Server returned HTML instead of JSON. Check Render URLs.", 500);
    }

    const body = await res.json();
    if (res.status === 401 && !window.location.pathname.includes('/login')) {
       window.location.href = '/login?next=' + window.location.pathname;
    }

    if (!res.ok) throw new ApiError(body.error?.code || 'ERR', body.error?.message || 'Fail', res.status);
    return body.data;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error("Server wake-up in progress. Refresh in 10s.");
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
