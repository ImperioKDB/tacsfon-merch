import { create } from 'zustand'

interface SelectedProductStore {
  /** The colour name of the currently selected variant (e.g. "Maroon", "Black") */
  variantColor: string | null
  setVariantColor: (color: string | null) => void
  reset: () => void
}

export const useSelectedProductStore = create<SelectedProductStore>((set) => ({
  variantColor: null,
  setVariantColor: (color) => set({ variantColor: color }),
  reset: () => set({ variantColor: null }),
}))