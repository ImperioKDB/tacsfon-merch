import { createBrowserClient } from '@/lib/supabase/browser';

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
      window.location.href = '/login?next=' + window.location.pathname;
      throw new Error("Session expired. Redirecting...");
  }

  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || 'Request failed');
  return body.data;
}
