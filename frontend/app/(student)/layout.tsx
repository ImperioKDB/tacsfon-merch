/**
 * Student layout — secondary auth guard.
 * Primary guard is middleware.ts. This catches edge cases
 * and provides defense-in-depth.
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ FIX: must await the Supabase client
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>{children}</main>
      <Footer />
    </>
  );
}