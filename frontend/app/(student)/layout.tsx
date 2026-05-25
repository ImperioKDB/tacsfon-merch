import { redirect }           from 'next/navigation'
import { headers }            from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import Navbar                 from '@/components/layout/Navbar'
import Footer                 from '@/components/layout/Footer'
import NotificationsProvider  from '@/components/notifications/NotificationsProvider'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  // FIX: use getUser() — verifies JWT server-side, unlike getSession()
  // which only reads cookies and cannot be trusted for auth checks.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
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
