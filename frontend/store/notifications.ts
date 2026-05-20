import { create } from 'zustand'

interface NotificationStore {
  /** Unread notification count shown in the bell badge */
  unreadCount: number
  /**
   * Increments on every new realtime notification.
   * NotificationBell watches this to trigger the shake animation.
   */
  pulseKey: number
  setUnreadCount: (n: number) => void
  increment: () => void
  markAllRead: () => void
  triggerPulse: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  pulseKey: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),
  triggerPulse: () => set((s) => ({ pulseKey: s.pulseKey + 1 })),
}))