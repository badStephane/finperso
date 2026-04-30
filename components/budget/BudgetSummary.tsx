'use client'

import { formatCFA } from '@/lib/utils/currency'
import type { Budget } from '@/types'

interface BudgetSummaryProps {
  budgets: Budget[]
}

export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remaining = totalBudget - totalSpent
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-2 mx-4 mt-3">
      <div className="bg-white border border-gray-200 rounded-xl p-3.5">
        <p className="text-xs text-gray-500 font-medium">Budget total</p>
        <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1 tabular-nums break-all">
          {formatCFA(totalBudget)}
        </p>
        <p
          className={`text-xs font-medium mt-1 ${
            pct > 90 ? 'text-[#993C1D]' : 'text-[#0F6E56]'
          }`}
        >
          {pct}% utilisé
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-3.5">
        <p className="text-xs text-gray-500 font-medium">Reste à dépenser</p>
        <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1 tabular-nums break-all">
          {formatCFA(Math.max(remaining, 0))}
        </p>
        <p
          className={`text-xs font-medium mt-1 ${
            remaining < 0 ? 'text-[#993C1D]' : 'text-[#0F6E56]'
          }`}
        >
          {remaining < 0 ? 'Budget dépassé' : 'Disponible'}
        </p>
      </div>
    </div>
  )
}
