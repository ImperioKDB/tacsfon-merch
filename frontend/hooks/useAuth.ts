'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  // Explicitly tell TypeScript this state holds a User or null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return { user, loading, signOut };
}
