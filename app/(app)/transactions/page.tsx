'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SearchBar } from '@/components/transactions/SearchBar'
import { TransactionFilterBar } from '@/components/transactions/TransactionFilters'
import { TransactionList } from '@/components/transactions/TransactionList'
import { matchesTransaction } from '@/lib/utils/search'
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
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function handleTypeChange(type?: 'DEPENSE' | 'REVENU' | 'TRANSFERT') {
    const newFilters = { ...filters, type, categoryId: undefined }
    setFilters(newFilters)
    loadTransactions(newFilters)
  }

  function handleCategoryChange(categoryId?: string) {
    const newFilters = { ...filters, categoryId, type: undefined }
    setFilters(newFilters)
    loadTransactions(newFilters)
  }

  const filtered = useMemo(
    () => transactions.filter((t) => matchesTransaction(t, search)),
    [transactions, search]
  )

  const isSearching = search.trim().length > 0

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
      <SearchBar value={search} onChange={setSearch} />
      <TransactionFilterBar
        activeType={filters.type}
        activeCategoryId={filters.categoryId}
        categories={categories}
        onTypeChange={handleTypeChange}
        onCategoryChange={handleCategoryChange}
      />
      {isSearching && transactions.length > 0 && (
        <p
          aria-live="polite"
          className="px-4 py-2 text-xs text-gray-500 bg-white border-b border-gray-100 tabular-nums"
        >
          {filtered.length === 0
            ? `Aucun résultat${hasMore ? ' — chargez plus pour étendre la recherche' : ''}`
            : `${filtered.length} sur ${transactions.length} affiché${filtered.length > 1 ? 's' : ''}`}
        </p>
      )}
      <TransactionList
        transactions={filtered}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onDelete={remove}
      />
    </div>
  )
}
