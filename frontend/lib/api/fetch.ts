import { createBrowserClient } from '@/lib/supabase/browser';

// 1. Singleton instance: avoid recreating the client per-request
const supabase = createBrowserClient();

// 2. Refresh Mutex: Ensures only one refresh happens even if 10 calls fail
let refreshPromise: Promise<any> | null = null;

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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
       console.warn("Session 401. Locking refresh mutex...");

       // IF a refresh is already in progress, wait for IT. Don't start a new one.
       if (!refreshPromise) {
         refreshPromise = supabase.auth.refreshSession().finally(() => {
           refreshPromise = null;
         });
       }
       
       const { data: ref } = await refreshPromise;
       
       if (ref.session) {
          console.log("Token rotated successfully. Retrying original request...");
          const retryHeaders = { ...headers, 'Authorization': `Bearer ${ref.session.access_token}` };
          const retryRes = await fetch(url, { ...options, headers: retryHeaders });
          const retryBody = await retryRes.json();
          if (retryRes.ok) return retryBody.data;
       }
       
       // If we get here, the session is truly unrecoverable
       if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?next=' + window.location.pathname;
       }
       throw new ApiError("UNAUTHORIZED", "Session lost.", 401);
    }

    const body = await res.json();
    if (!res.ok) throw new ApiError(body.error?.code || 'ERR', body.error?.message || 'Fail', res.status);
    return body.data;

  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || "Network Error");
  }
}
