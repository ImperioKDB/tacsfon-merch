import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  
  // CRITICAL FIX: Refresh the session immediately before making the call
  // This prevents the 'expired token' kick during cold starts.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  const token = session?.access_token;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // Increased to 35s for heavy cold starts

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

    // If the server rejected us, we only kick to login if we can't refresh
    if (res.status === 401) {
       console.warn("Server returned 401. Attempting one-time token refresh...");
       const { data: refreshed } = await supabase.auth.refreshSession();
       
       if (!refreshed.session && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?next=' + window.location.pathname;
          throw new ApiError("UNAUTHORIZED", "Session totally lost.", 401);
       }
       
       // Tell the user to try the button one more time now that we are refreshed
       throw new ApiError("RETRY", "Connection synchronized. Please click the button again.", 401);
    }

    const body = await res.json();
    if (!res.ok || body.success === false) {
      throw new ApiError(body.error?.code || 'ERROR', body.error?.message || 'Request failed', res.status);
    }
    return body.data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error("The server is still waking up. Please wait 10 seconds and try again.");
    }
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
