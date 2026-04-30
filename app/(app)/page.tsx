'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { useComptes } from '@/hooks/useComptes'
import { getMonthKey } from '@/lib/utils/dates'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction, Budget } from '@/types'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { comptes } = useComptes()
  const toast = useToastStore((s) => s.show)
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const monthKey = getMonthKey(new Date())
  const monthStats = profile?.monthlyStats?.[monthKey]

  useEffect(() => {
    if (!user) return

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
        toast('Erreur de chargement', 'error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user, toast])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <p className="text-xs text-gray-500">Bonjour 👋</p>
        <p className="text-base font-medium text-gray-900">{profile?.name}</p>
      </div>

      <BalanceCard comptes={comptes} monthStats={monthStats} />
      <RecentTransactions transactions={recentTx} />
      <SpendingChart budgets={budgets} />
      <div className="h-4" />
    </div>
  )
}
