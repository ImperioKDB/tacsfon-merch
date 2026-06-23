'use client';

/**
 * NotificationBell
 *
 * Renders in the Navbar (replaces the plain bell Link from Phase 1).
 * - Bell icon + red badge (unreadCount from Zustand)
 * - Click to open dropdown; click outside to close
 * - Fetches GET /api/notifications when dropdown opens
 * - Bell shake animation on new realtime notification (pulseKey)
 * - Mark single: PATCH /api/notifications/:id/read
 * - Mark all:    PATCH /api/notifications/read-all
 * - Navigates to /orders on click (all notifications are order-related)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount, pulseKey, markAllRead, setUnreadCount } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPulseKey = useRef(pulseKey);

  // Bell shake on new realtime notification
  useEffect(() => {
    if (pulseKey === prevPulseKey.current) return;
    prevPulseKey.current = pulseKey;
    setIsShaking(true);
    const t = 
    return () => clearTimeout(t);
  }, [pulseKey]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<NotificationsResponse>('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unread);
    } catch {
      toast.error('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  function handleBellClick() {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) fetchNotifications();
  }

  async function handleMarkAllRead() {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      markAllRead();
    } catch {
      toast.error('Failed to mark all as read.');
    }
  }

  async function handleItemClick(notification: Notification) {
    setIsOpen(false);
    // Mark as read if not already
    if (!notification.is_read) {
      try {
        await apiFetch(`/notifications/${notification.id}/read`, { method: 'PATCH' });
        setNotifications((prev) =>
          prev.map((n) => n.id === notification.id ? { ...n, is_read: true } : n),
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch {
        // Non-blocking
      }
    }
    // All notifications are order-related — go to orders list
    router.push('/orders');
  }

  const badgeCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <>
      {/* Bell shake keyframe */}
      <style>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          15%       { transform: rotate(15deg); }
          30%       { transform: rotate(-14deg); }
          45%       { transform: rotate(10deg); }
          60%       { transform: rotate(-8deg); }
          75%       { transform: rotate(4deg); }
        }
        .bell-shake { animation: bellShake 0.7s ease both; }
      `}</style>

      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Bell button */}
        <button
          onClick={handleBellClick}
          aria-label={`Notifications, ${unreadCount} unread`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isOpen ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <Bell
            size={20}
            strokeWidth={1.5}
            className={isShaking ? 'bell-shake' : ''}
          />
          {/* Red badge */}
          {unreadCount > 0 && (
            <span
              className="notif-dot"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                background: 'var(--danger)',
                color: '#fff',
                fontSize: '0.5625rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                borderRadius: '9999px',
              }}
            >
              {badgeCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="Notifications"
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: '-8px',
              width: '340px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 60,
            }}
          >
            {/* Dropdown header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '0.06em',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {loading && (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: '56px',
                        marginBottom: '1px',
                        background: 'var(--bg-elevated)',
                      }}
                      className="skeleton"
                    />
                  ))}
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  No notifications yet
                </div>
              )}

              {!loading && notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: notif.is_read ? 'transparent' : 'var(--bg-elevated)',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      notif.is_read ? 'transparent' : 'var(--bg-elevated)';
                  }}
                >
                  {/* Unread dot + message */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span
                      className="notif-dot"
                      style={{
                        flexShrink: 0,
                        width: '7px',
                        height: '7px',
                        background: notif.is_read ? 'transparent' : 'var(--accent)',
                        borderRadius: '9999px',
                        marginTop: '5px',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: notif.is_read
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                          fontFamily: 'var(--font-body)',
                          lineHeight: '1.4',
                          marginBottom: '4px',
                        }}
                      >
                        {notif.message}
                      </p>
                      <p
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {formatRelativeTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer link */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <button
                onClick={() => { setIsOpen(false); router.push('/notifications'); }}
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.06em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}