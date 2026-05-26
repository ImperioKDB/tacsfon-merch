'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const getInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: p } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(p?.role || 'student');
      }
      setLoading(false);
    };
    getInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: p } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(p?.role || 'student');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return { user, role, isAdmin: role === 'admin', loading, signOut };
}
