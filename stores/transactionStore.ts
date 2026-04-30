import { create } from 'zustand'
import type { Transaction, TransactionFilters } from '@/types'
import type { DocumentSnapshot } from 'firebase/firestore'

interface TransactionState {
  transactions: Transaction[]
  filters: TransactionFilters
  lastDoc: DocumentSnapshot | null
  hasMore: boolean
  loading: boolean
  setTransactions: (transactions: Transaction[]) => void
  appendTransactions: (transactions: Transaction[]) => void
  setFilters: (filters: TransactionFilters) => void
  setLastDoc: (lastDoc: DocumentSnapshot | null) => void
  setHasMore: (hasMore: boolean) => void
  setLoading: (loading: boolean) => void
  removeTransaction: (id: string) => void
  reset: () => void
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  filters: {},
  lastDoc: null,
  hasMore: false,
  loading: false,
  setTransactions: (transactions) => set({ transactions }),
  appendTransactions: (newTx) =>
    set((state) => ({ transactions: [...state.transactions, ...newTx] })),
  setFilters: (filters) => set({ filters }),
  setLastDoc: (lastDoc) => set({ lastDoc }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoading: (loading) => set({ loading }),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  reset: () =>
    set({
      transactions: [],
      lastDoc: null,
      hasMore: false,
      loading: false,
    }),
}))
