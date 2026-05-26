import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  
  // FORCE REFRESH: Get the freshest session possible
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const token = session?.access_token;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    
    // If Backend says token is expired (401), force a logout/refresh
    if (res.status === 401) {
       await supabase.auth.signOut();
       window.location.href = '/login?error=session_expired';
       throw new Error("Session expired");
    }

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
