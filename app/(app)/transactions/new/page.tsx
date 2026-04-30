'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { TransactionForm } from '@/components/transactions/TransactionForm'

export default function NewTransactionPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-medium text-gray-900">Nouvelle transaction</h1>
      </div>
      <TransactionForm />
    </div>
  )
}
