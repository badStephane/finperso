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
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <h2 className="text-base font-semibold text-gray-900">Récentes</h2>
        <Link
          href="/transactions"
          className="text-sm text-[#1D9E75] font-medium px-2 -mr-2 py-1.5 rounded-md active:bg-[#E1F5EE]"
        >
          Voir tout
        </Link>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucune transaction</p>
        ) : (
          transactions.map((tx) => (
            <Link
              href={`/transactions`}
              key={tx.id}
              className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors min-h-[56px]"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: '#E1F5EE' }}
              >
                {tx.categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate font-medium">
                  {tx.note || tx.categoryName}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {tx.categoryName} · {formatDateShort(tx.date.toDate())}
                </p>
              </div>
              <span
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  tx.type === 'DEPENSE' ? 'text-[#993C1D]' : 'text-[#0F6E56]'
                }`}
              >
                {tx.type === 'DEPENSE' ? '−' : '+'}
                {formatCFA(tx.amount)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
