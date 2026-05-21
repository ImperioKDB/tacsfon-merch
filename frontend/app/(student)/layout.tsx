/**
 * Student layout — secondary auth guard.
 * Primary guard is middleware.ts. This catches edge cases
 * and provides defense-in-depth.
 *
 * Uses x-pathname header (forwarded by middleware) to build a
 * ?next= redirect URL so the user returns here after login.
 *
 * NotificationsProvider is mounted here so the realtime subscription
 * is active for all student pages and torn down on navigation away.
 */

import { redirect }              from 'next/navigation'
import { headers }               from 'next/headers'
import { createServerClient }    from '@/lib/supabase/server'
import Navbar                    from '@/components/layout/Navbar'
import Footer                    from '@/components/layout/Footer'
import NotificationsProvider     from '@/components/notifications/NotificationsProvider'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const headersList = headers()
    const pathname    = headersList.get('x-pathname') ?? '/'
    redirect(`/login?next=${encodeURIComponent(pathname)}`)
  }

  return (
    <>
      <Navbar />
      <NotificationsProvider>
        <main style={{ paddingTop: '72px' }}>{children}</main>
      </NotificationsProvider>
      <Footer />
    </>
  )
}
