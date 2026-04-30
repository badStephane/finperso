'use client'

import { useEffect } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { TransactionFilterBar } from '@/components/transactions/TransactionFilters'
import { TransactionList } from '@/components/transactions/TransactionList'
import { formatMonthYear } from '@/lib/utils/dates'

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    hasMore,
    filters,
    setFilters,
    loadTransactions,
    loadMore,
    remove,
  } = useTransactions()
  const { categories } = useCategories()

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function handleTypeChange(type?: 'DEPENSE' | 'REVENU') {
    const newFilters = { ...filters, type, categoryId: undefined }
    setFilters(newFilters)
    loadTransactions(newFilters)
  }

  function handleCategoryChange(categoryId?: string) {
    const newFilters = { ...filters, categoryId, type: undefined }
    setFilters(newFilters)
    loadTransactions(newFilters)
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Transactions"
        action={
          <Badge variant="positive">
            {formatMonthYear(new Date())}
          </Badge>
        }
      />
      <TransactionFilterBar
        activeType={filters.type}
        activeCategoryId={filters.categoryId}
        categories={categories}
        onTypeChange={handleTypeChange}
        onCategoryChange={handleCategoryChange}
      />
      <TransactionList
        transactions={transactions}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onDelete={remove}
      />
    </div>
  )
}
