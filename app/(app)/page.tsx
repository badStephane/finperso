'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { useComptes } from '@/hooks/useComptes'
import { getMonthKey } from '@/lib/utils/dates'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { PendingRecurrences } from '@/components/dashboard/PendingRecurrences'
import { QuickAdd } from '@/components/dashboard/QuickAdd'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Transaction, Budget } from '@/types'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { comptes } = useComptes()
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const monthKey = getMonthKey(new Date())
  const monthStats = profile?.monthlyStats?.[monthKey]

  const load = () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    Promise.all([
      getDocs(
        query(
          collection(db, `users/${user.uid}/transactions`),
          where('deletedAt', '==', null),
          orderBy('date', 'desc'),
          limit(5)
        )
      ),
      getDocs(
        query(
          collection(db, `users/${user.uid}/budgets`),
          where('month', '==', month),
          where('year', '==', year)
        )
      ),
    ])
      .then(([txSnap, budgetSnap]) => {
        setRecentTx(txSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction))
        setBudgets(budgetSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Budget))
      })
      .catch(() => {
        setError('load')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={load} />
  }

  return (
    <div className="flex-1">
      <div
        className="bg-white px-4 pb-3 border-b border-gray-200"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <p className="text-sm text-gray-500">Bonjour 👋</p>
        <p className="text-base font-medium text-gray-900">{profile?.name}</p>
      </div>

      <BalanceCard comptes={comptes} monthStats={monthStats} />
      <PendingRecurrences />
      <QuickAdd comptes={comptes} />
      <RecentTransactions transactions={recentTx} />
      <SpendingChart budgets={budgets} />
      <div className="h-4" />
    </div>
  )
}
