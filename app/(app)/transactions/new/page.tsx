'use client'

import { TransactionForm } from '@/components/transactions/TransactionForm'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NewTransactionPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Nouvelle transaction" back />
      <TransactionForm />
    </div>
  )
}
