import { create } from 'zustand'
import type { Budget } from '@/types'

interface BudgetState {
  budgets: Budget[]
  month: number
  year: number
  loading: boolean
  setBudgets: (budgets: Budget[]) => void
  setMonth: (month: number) => void
  setYear: (year: number) => void
  setLoading: (loading: boolean) => void
}

const now = new Date()

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  loading: false,
  setBudgets: (budgets) => set({ budgets }),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setLoading: (loading) => set({ loading }),
}))
