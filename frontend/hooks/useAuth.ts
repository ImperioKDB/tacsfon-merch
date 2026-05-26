'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  // Fix: Explicitly tell TypeScript this can be a User OR null
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) return 'student';
      return data?.role || 'student';
    } catch (e) {
      return 'student';
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const userRole = await fetchProfile(session.user.id);
        setRole(userRole);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userRole = await fetchProfile(session.user.id);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    user, 
    role, 
    loading, 
    isAdmin: role === 'admin',
    isAuthenticated: !!user 
  };
}
