import { redirect }           from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminShell             from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()

  // getUser() verifies the JWT with Supabase Auth on every request.
  // getSession() only reads from cookies — never use it for server-side auth.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id, full_name, email, role')
    .eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <AdminShell adminName={profile.full_name ?? profile.email}>
      {children}
    </AdminShell>
  )
}
