'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToastStore } from '@/stores/toastStore'
import * as txService from '@/lib/services/transactionService'
import type { CreateTransactionInput, Transaction, TransactionFilters } from '@/types'

export function useTransactions() {
  const user = useAuthStore((s) => s.user)
  const transactions = useTransactionStore((s) => s.transactions)
  const filters = useTransactionStore((s) => s.filters)
  const lastDoc = useTransactionStore((s) => s.lastDoc)
  const hasMore = useTransactionStore((s) => s.hasMore)
  const loading = useTransactionStore((s) => s.loading)
  const setTransactions = useTransactionStore((s) => s.setTransactions)
  const appendTransactions = useTransactionStore((s) => s.appendTransactions)
  const setFilters = useTransactionStore((s) => s.setFilters)
  const setLastDoc = useTransactionStore((s) => s.setLastDoc)
  const setHasMore = useTransactionStore((s) => s.setHasMore)
  const setLoading = useTransactionStore((s) => s.setLoading)
  const removeTransaction = useTransactionStore((s) => s.removeTransaction)
  const reset = useTransactionStore((s) => s.reset)
  const toast = useToastStore((s) => s.show)

  const loadTransactions = useCallback(
    async (newFilters?: TransactionFilters) => {
      if (!user) return
      setLoading(true)
      reset()
      const appliedFilters = newFilters ?? filters
      try {
        const result = await txService.getTransactions(user.uid, appliedFilters)
        setTransactions(result.transactions)
        setLastDoc(result.lastDoc)
        setHasMore(result.hasMore)
      } catch {
        toast('Erreur de chargement', 'error')
      } finally {
        setLoading(false)
      }
    },
    [user, filters, setLoading, reset, setTransactions, setLastDoc, setHasMore, toast]
  )

  const loadMore = useCallback(async () => {
    if (!user || !lastDoc) return
    setLoading(true)
    try {
      const result = await txService.getTransactions(user.uid, filters, lastDoc)
      appendTransactions(result.transactions)
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch {
      toast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, lastDoc, filters, setLoading, appendTransactions, setLastDoc, setHasMore, toast])

  const add = useCallback(
    async (data: CreateTransactionInput) => {
      if (!user) throw new Error('Not authenticated')
      try {
        await txService.addTransaction(user.uid, data)
      } catch (err) {
        console.error('[useTransactions.add] failed', err)
        throw err
      }
    },
    [user]
  )

  const remove = useCallback(
    async (transaction: Transaction) => {
      if (!user) return
      try {
        await txService.deleteTransaction(user.uid, transaction.id, transaction)
        removeTransaction(transaction.id)
        toast('Transaction supprimée')
      } catch {
        toast('Erreur lors de la suppression', 'error')
      }
    },
    [user, removeTransaction, toast]
  )

  return {
    transactions,
    loading,
    hasMore,
    filters,
    setFilters,
    loadTransactions,
    loadMore,
    add,
    remove,
  }
}
