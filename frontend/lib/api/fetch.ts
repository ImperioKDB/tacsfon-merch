import { createBrowserClient } from '@/lib/supabase/browser';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createBrowserClient();
  
  // Get the session, allowing Supabase to handle the refresh logic internally
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
      console.warn("Unauthorized request to:", path);
      // We don't force redirect here anymore to prevent the "Split Second" crash
      throw new Error("UNAUTHORIZED");
  }

  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || "API Error");
  }
  return body.data;
}
