/**
 * @/lib/api/apiFetch
 * Thin wrapper around fetch for use in server components / route handlers.
 * Automatically parses JSON and throws on non-2xx responses.
 */

export class ApiFetchError extends Error {
  constructor(
    public status: number,
    public code:   string,
    message:       string,
  ) {
    super(message)
    this.name = 'ApiFetchError'
  }
}

export async function apiFetch<T = unknown>(
  url:     string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const code    = body?.error?.code    ?? 'UNKNOWN_ERROR'
    const message = body?.error?.message ?? `Request failed with status ${res.status}`
    throw new ApiFetchError(res.status, code, message)
  }

  return (body?.data ?? body) as T
}
