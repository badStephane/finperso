'use client'

import Link from 'next/link'
import { formatCFA } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import type { Transaction } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium text-gray-900">Récentes</h2>
        <Link href="/transactions" className="text-xs text-[#1D9E75]">
          Voir tout
        </Link>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            Aucune transaction
          </p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: '#E1F5EE' }}
              >
                {tx.categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {tx.note || tx.categoryName}
                </p>
                <p className="text-[10px] text-gray-500">
                  {tx.categoryName} · {formatDateShort(tx.date.toDate())}
                </p>
              </div>
              <span
                className={`text-sm font-medium ${
                  tx.type === 'DEPENSE' ? 'text-[#993C1D]' : 'text-[#0F6E56]'
                }`}
              >
                {tx.type === 'DEPENSE' ? '-' : '+'}
                {formatCFA(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
