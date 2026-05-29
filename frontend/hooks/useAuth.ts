'use client';
import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data) setIsAdmin(data.role === 'admin');
    } catch (e) { console.error("Role check failed"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        const u = session?.user ?? null;
        setUser(u);
        if (u) fetchRole(u.id);
        else setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchRole(u.id);
      else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [supabase, fetchRole]);

  const signOut = async () => {
    // OPTIMISTIC UI: Wipe state immediately
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login'; // Hard reset
  };

  return { user, isAdmin, loading, signOut };
}
