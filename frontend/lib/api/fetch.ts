import { createBrowserClient } from '@/lib/supabase/browser';

/**
 * Custom error class for API-level errors.
 * Exported so that admin pages can check 'instanceof ApiError'
 */
export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  
  // Force a session refresh check before every admin call
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
      // If truly expired, kick to login to get a fresh start
      if (typeof window !== 'undefined') {
          window.location.href = '/login?next=' + window.location.pathname;
      }
      throw new ApiError("UNAUTHORIZED", "Session expired. Redirecting...", 401);
  }

  const body = await res.json();
  
  if (!res.ok) {
      throw new ApiError(
          body.error?.code || 'FETCH_ERROR', 
          body.error?.message || 'Request failed', 
          res.status
      );
  }
  
  return body.data;
}
