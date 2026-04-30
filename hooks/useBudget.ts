'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useToastStore } from '@/stores/toastStore'
import * as budgetService from '@/lib/services/budgetService'

export function useBudget() {
  const user = useAuthStore((s) => s.user)
  const budgets = useBudgetStore((s) => s.budgets)
  const month = useBudgetStore((s) => s.month)
  const year = useBudgetStore((s) => s.year)
  const loading = useBudgetStore((s) => s.loading)
  const setBudgets = useBudgetStore((s) => s.setBudgets)
  const setMonth = useBudgetStore((s) => s.setMonth)
  const setYear = useBudgetStore((s) => s.setYear)
  const setLoading = useBudgetStore((s) => s.setLoading)
  const toast = useToastStore((s) => s.show)

  const loadBudgets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await budgetService.getBudgets(user.uid, month, year)
      setBudgets(result)
    } catch {
      toast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, month, year, setLoading, setBudgets, toast])

  const setBudget = useCallback(
    async (data: {
      categoryId: string
      categoryName: string
      categoryIcon: string
      amount: number
    }) => {
      if (!user) return
      try {
        await budgetService.setBudget(user.uid, {
          ...data,
          month,
          year,
        })
        toast('Budget mis à jour')
        await loadBudgets()
      } catch {
        toast('Erreur lors de la mise à jour', 'error')
      }
    },
    [user, month, year, toast, loadBudgets]
  )

  const remove = useCallback(
    async (budgetId: string) => {
      if (!user) return
      try {
        await budgetService.deleteBudget(user.uid, budgetId)
        toast('Budget supprimé')
        await loadBudgets()
      } catch {
        toast('Erreur lors de la suppression', 'error')
      }
    },
    [user, toast, loadBudgets]
  )

  return {
    budgets,
    month,
    year,
    loading,
    setMonth,
    setYear,
    loadBudgets,
    setBudget,
    remove,
  }
}
