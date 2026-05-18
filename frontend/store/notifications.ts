import { create } from 'zustand'

interface NotificationStore {
  /** Unread notification count shown in the bell badge */
  unreadCount: number
  setUnreadCount: (n: number) => void
  increment: () => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),
}))