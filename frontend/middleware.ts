import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const STUDENT_ROUTES = ['/cart', '/checkout', '/orders', '/profile', '/notifications']
// Routes that require admin role (role check done in layout — middleware only checks session)
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const pathname = request.nextUrl.pathname

  // Refresh Supabase session on every request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(
          cookiesToSet: {
            name: string
            value: string
            options?: any
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Student route guard
  const needsAuth = STUDENT_ROUTES.some((r) => pathname.startsWith(r))
  if (needsAuth && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin route guard
  const needsAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (needsAdmin && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}