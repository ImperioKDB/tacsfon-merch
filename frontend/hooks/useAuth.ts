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
    let mounted = true;
    const sync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const u = session?.user ?? null;
        if (!mounted) return;
        setUser(u);
        if (u) {
          const { data: p } = await supabase.from('profiles').select('role').eq('id', u.id).single();
          setIsAdmin(p?.role === 'admin');
        }
      } catch (err) {
        console.error("Auth sync error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    sync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      if (!mounted) return;
      setUser(u);
      if (u) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', u.id).single();
        setIsAdmin(p?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return { user, isAdmin, loading, signOut };
}
