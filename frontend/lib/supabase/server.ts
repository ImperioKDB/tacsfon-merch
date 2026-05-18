import { createServerClient as _create, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Must be called inside a request context.
 */
export async function createServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return _create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // Session refresh is handled by middleware.ts instead.
          }
        },
      },
    },
  );
}