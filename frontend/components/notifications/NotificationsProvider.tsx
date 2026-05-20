'use client';

/**
 * NotificationsProvider
 *
 * Mount inside (student)/layout.tsx.
 * - Fetches initial unread count on mount.
 * - Subscribes to Supabase Realtime for new notifications.
 * - On new notification: increment badge, trigger bell shake, show toast.
 * - Unsubscribes on unmount (no memory leaks).
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { createBrowserClient } from '@/lib/supabase/browser';
import { apiFetch } from '@/lib/api/fetch';
import { useNotificationStore } from '@/store/notifications';

interface NotificationsResponse {
  notifications: { id: string; message: string; is_read: boolean; created_at: string }[];
  total: number;
  unread: number;
}

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { setUnreadCount, increment, triggerPulse } = useNotificationStore();

  useEffect(() => {
    const supabase = createBrowserClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      // 1. Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // 2. Fetch initial unread count
      try {
        const data = await apiFetch<NotificationsResponse>('/notifications');
        setUnreadCount(data.unread);
      } catch {
        // Non-critical — badge stays at 0
      }

      // 3. Subscribe to realtime inserts
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const message = (payload.new as { message: string }).message ?? 'New notification';
            increment();
            triggerPulse();
            toast.info(message, { duration: 5000 });
          },
        )
        .subscribe();
    }

    init();

    // 4. Cleanup on unmount — critical to prevent memory leaks
    return () => {
      if (channel) {
        const supabaseCleanup = createBrowserClient();
        supabaseCleanup.removeChannel(channel);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}