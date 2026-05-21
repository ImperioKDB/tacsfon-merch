import { NextResponse }  from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const STUDENT_ROUTES = ['/cart', '/checkout', '/orders', '/profile', '/notifications']
const ADMIN_ROUTES   = ['/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const pathname  = request.nextUrl.pathname

  // Forward pathname so server layouts can construct ?next= redirect URLs
  response.headers.set('x-pathname', pathname)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // getSession() is acceptable in middleware (performance — no network call).
  // Use getUser() in server components/layouts for trusted verification.
  const { data: { session } } = await supabase.auth.getSession()

  const needsAuth = STUDENT_ROUTES.some((r) => pathname.startsWith(r))
  if (needsAuth && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const needsAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (needsAdmin) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url))

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
