import { create } from 'zustand'

interface CartStore {
  /** Total item count shown in the navbar badge */
  count: number
  setCount: (n: number) => void
  increment: (by?: number) => void
  decrement: (by?: number) => void
  reset: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  count: 0,
  setCount: (n) => set({ count: Math.max(0, n) }),
  increment: (by = 1) => set((s) => ({ count: s.count + by })),
  decrement: (by = 1) => set((s) => ({ count: Math.max(0, s.count - by) })),
  reset: () => set({ count: 0 }),
}))