'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/fetch';
import { useNotificationStore } from '@/store/notifications';

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

function formatRelativeTime(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { markAllRead, setUnreadCount } = useNotificationStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<NotificationsResponse>('/notifications');
        setNotifications(data.notifications);
        setUnreadCount(data.unread);
      } catch {
        toast.error('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setUnreadCount]);

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      markAllRead();
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleItemClick(notif: Notification) {
    if (!notif.is_read) {
      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PATCH' });
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n),
        );
        setUnreadCount(
          Math.max(0, notifications.filter((n) => !n.is_read).length - 1),
        );
      } catch {
        // Non-blocking
      }
    }
    router.push('/orders');
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell size={22} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="notif-dot"
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  fontFamily: 'var(--font-body)',
                  borderRadius: '9999px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent)',
                background: 'none',
                border: '1px solid var(--accent)',
                cursor: markingAll ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                padding: '7px 14px',
                opacity: markingAll ? 0.5 : 1,
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!markingAll) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(61,186,111,0.10)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ border: '1px solid var(--border)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: '72px',
                  borderBottom: '1px solid var(--border)',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-4 py-20"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
          >
            <Bell size={36} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              No notifications yet
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              You'll be notified when your order status changes.
            </p>
          </div>
        )}

        {/* Notification list */}
        {!loading && notifications.length > 0 && (
          <div style={{ border: '1px solid var(--border)' }}>
            {notifications.map((notif, idx) => (
              <button
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  width: '100%',
                  padding: '16px 20px',
                  textAlign: 'left',
                  background: notif.is_read ? 'transparent' : 'var(--bg-surface)',
                  border: 'none',
                  borderBottom:
                    idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    notif.is_read ? 'transparent' : 'var(--bg-surface)';
                }}
              >
                {/* Unread indicator */}
                <span
                  className="notif-dot"
                  style={{
                    flexShrink: 0,
                    width: '8px',
                    height: '8px',
                    background: notif.is_read ? 'transparent' : 'var(--accent)',
                    borderRadius: '9999px',
                    marginTop: '6px',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: notif.is_read
                        ? 'var(--text-muted)'
                        : 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: '1.5',
                      marginBottom: '4px',
                    }}
                  >
                    {notif.message}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}