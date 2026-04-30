'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { TransactionType } from '@/types'

const VALID_TYPES = new Set<TransactionType>(['DEPENSE', 'REVENU', 'TRANSFERT'])

function NewTransactionContent() {
  const params = useSearchParams()
  const compteId = params.get('compteId') ?? undefined
  const typeParam = params.get('type')
  const defaultType =
    typeParam && VALID_TYPES.has(typeParam as TransactionType)
      ? (typeParam as TransactionType)
      : undefined

  return (
    <TransactionForm
      defaultCompteId={compteId}
      defaultType={defaultType}
      autoFocusAmount={Boolean(compteId)}
    />
  )
}

export default function NewTransactionPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Nouvelle transaction" back />
      <Suspense fallback={<div className="flex-1" />}>
        <NewTransactionContent />
      </Suspense>
    </div>
  )
}
