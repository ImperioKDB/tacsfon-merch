'use client';
import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();
  const router = useRouter();

  const syncProfile = useCallback(async (u: any) => {
    if (!u) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    // We fetch the profile, but we don't block the 'loading' state of the user account
    const { data: p } = await supabase.from('profiles').select('role').eq('id', u.id).single();
    setIsAdmin(p?.role === 'admin');
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    
    // Get session instantly from local storage/cookie
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        syncProfile(session?.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        syncProfile(currentUser);
      }
    });
    
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [supabase, syncProfile]);

  const signOut = async () => {
    // OPTIMISTIC SIGN OUT: Clear UI state immediately
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
    
    await supabase.auth.signOut();
    localStorage.clear(); 
    window.location.href = '/login'; // Hard redirect to reset all caches
  };

  return { user, isAdmin, loading, signOut };
}
