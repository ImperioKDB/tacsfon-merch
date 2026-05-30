import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Returns a valid (non-expired) access token.
 * - Reads the current session from storage
 * - Proactively refreshes if the token expires within 60 seconds
 * - Returns undefined if there is no session
 */
async function getValidToken(): Promise<string | undefined> {
  const supabase = createBrowserClient();
  let { data: { session } } = await supabase.auth.getSession();

  if (!session) return undefined;

  // Proactively refresh if token expires within the next 60 seconds
  const expiresAt = (session.expires_at ?? 0) * 1000;
  if (expiresAt - 60_000 < Date.now()) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed.session;
  }

  return session?.access_token;
}

function buildHeaders(
  token: string | undefined,
  extraHeaders?: HeadersInit,
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidToken();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}/api${path.startsWith('/') ? path : '/' + path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: buildHeaders(token, options.headers),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Detect HTML error page (Render/Supabase 404 or cold-start page)
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      throw new ApiError(
        'BACKEND_OFFLINE',
        'Server returned HTML instead of JSON. Check Render URLs.',
        500,
      );
    }

    // ── 401 handling: refresh the session and retry ONCE before giving up ──
    if (res.status === 401) {
      const supabase = createBrowserClient();
      const { data: refreshed } = await supabase.auth.refreshSession();
      const newToken = refreshed.session?.access_token;

      if (newToken) {
        // Retry the original request with the fresh token
        const retryController = new AbortController();
        const retryTimeout = setTimeout(() => retryController.abort(), 20_000);
        const retryRes = await fetch(url, {
          ...options,
          headers: buildHeaders(newToken, options.headers),
          signal: retryController.signal,
        });
        clearTimeout(retryTimeout);

        const retryBody = await retryRes.json().catch(() => ({}));

        if (retryRes.ok) return retryBody.data as T;

        throw new ApiError(
          retryBody.error?.code || 'ERR',
          retryBody.error?.message || 'Request failed',
          retryRes.status,
        );
      }

      // Refresh itself failed — session is truly gone, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?next=' + window.location.pathname;
      }
      throw new ApiError('UNAUTHORIZED', 'Session expired. Please sign in again.', 401);
    }

    const body = await res.json();
    if (!res.ok) {
      throw new ApiError(body.error?.code || 'ERR', body.error?.message || 'Request failed', res.status);
    }

    return body.data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Server wake-up in progress. Refresh in 10s.');
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}
