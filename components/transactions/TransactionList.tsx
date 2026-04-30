'use client'

import { useMemo } from 'react'
import { formatDate } from '@/lib/utils/dates'
import { TransactionItem } from './TransactionItem'
import { SkeletonTransaction } from '@/components/ui/SkeletonLoader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Receipt } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionList({
  transactions,
  loading,
  hasMore,
  onLoadMore,
  onDelete,
}: TransactionListProps) {
  const grouped = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = []
    transactions.forEach((tx) => {
      const dateStr = formatDate(tx.date.toDate())
      const existing = groups.find((g) => g.date === dateStr)
      if (existing) {
        existing.items.push(tx)
      } else {
        groups.push({ date: dateStr, items: [tx] })
      }
    })
    return groups
  }, [transactions])

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTransaction key={i} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune transaction"
        description="Ajoutez votre première transaction"
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4 stagger-children">
      {grouped.map((group) => (
        <div key={group.date}>
          <p className="px-4 pt-4 pb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {group.date}
          </p>
          <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {group.items.map((tx) => (
              <div key={tx.id} className="border-b border-gray-100 last:border-b-0">
                <TransactionItem transaction={tx} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full min-h-[48px] mt-3 py-3 text-sm text-[#1D9E75] font-semibold disabled:opacity-50 active:bg-[#E1F5EE] transition-colors"
        >
          {loading ? 'Chargement...' : 'Charger plus'}
        </button>
      )}
    </div>
  )
}
