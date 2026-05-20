'use server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id, full_name, email, role')
    .eq('id', session.user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <AdminShell adminName={profile.full_name ?? profile.email}>
      {children}
    </AdminShell>
  )
}