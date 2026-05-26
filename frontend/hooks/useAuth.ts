'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  const getProfile = async (id: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', id).single();
    return data?.role || 'student';
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const r = await getProfile(session.user.id);
        setRole(r);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const r = await getProfile(session.user.id);
        setRole(r);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, role, isAdmin: role === 'admin', loading, signOut: () => supabase.auth.signOut().then(() => window.location.href='/') };
}
