import { create } from 'zustand'
import type { Objectif } from '@/types'

interface ObjectifState {
  objectifs: Objectif[]
  loading: boolean
  setObjectifs: (objectifs: Objectif[]) => void
  setLoading: (loading: boolean) => void
}

export const useObjectifStore = create<ObjectifState>((set) => ({
  objectifs: [],
  loading: false,
  setObjectifs: (objectifs) => set({ objectifs }),
  setLoading: (loading) => set({ loading }),
}))
