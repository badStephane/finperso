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
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Récentes</h2>
        <Link
          href="/transactions"
          className="text-sm text-[#1D9E75] dark:text-[#2BB68B] font-medium px-2 -mr-2 py-1.5 rounded-md active:bg-[#E1F5EE] dark:active:bg-[#0F2B23]"
        >
          Voir tout
        </Link>
      </div>
      <div className="mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Aucune transaction</p>
        ) : (
          transactions.map((tx) => (
            <Link
              href={`/transactions`}
              key={tx.id}
              className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 active:bg-gray-50 dark:active:bg-gray-800 transition-colors min-h-[56px]"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: tx.type === 'TRANSFERT' ? '#F3F4F6' : '#E1F5EE' }}
              >
                {tx.categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                  {tx.note || tx.categoryName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {tx.type === 'TRANSFERT'
                    ? `${tx.compteName} → ${tx.toCompteName ?? '?'}`
                    : `${tx.categoryName} · ${formatDateShort(tx.date.toDate())}`}
                </p>
              </div>
              <span
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  tx.type === 'DEPENSE'
                    ? 'text-[#993C1D] dark:text-[#F0997B]'
                    : tx.type === 'REVENU'
                      ? 'text-[#0F6E56] dark:text-[#2BB68B]'
                      : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {tx.type === 'DEPENSE' ? '−' : tx.type === 'REVENU' ? '+' : ''}
                {formatCFA(tx.amount)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
