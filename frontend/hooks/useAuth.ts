'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const sync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const { data: p } = await supabase.from('profiles').select('role').eq('id', u.id).single();
          setIsAdmin(p?.role === 'admin');
        }
      } catch (e) {
        console.error("Auth sync error", e);
      } finally {
        setLoading(false); // ALWAYS stop loading
      }
    };
    sync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', u.id).single();
        setIsAdmin(p?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, isAdmin, loading, signOut: () => supabase.auth.signOut().then(() => window.location.href='/') };
}
