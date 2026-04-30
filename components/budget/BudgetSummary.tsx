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
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <p className="text-[10px] text-gray-500">Budget total</p>
        <p className="text-lg font-medium text-gray-900 mt-0.5">
          {formatCFA(totalBudget)}
        </p>
        <p className={`text-[10px] mt-0.5 ${pct > 90 ? 'text-[#993C1D]' : 'text-[#0F6E56]'}`}>
          {pct}% utilisé
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <p className="text-[10px] text-gray-500">Reste à dépenser</p>
        <p className="text-lg font-medium text-gray-900 mt-0.5">
          {formatCFA(Math.max(remaining, 0))}
        </p>
        <p className={`text-[10px] mt-0.5 ${remaining < 0 ? 'text-[#993C1D]' : 'text-[#0F6E56]'}`}>
          {remaining < 0 ? 'Budget dépassé' : 'Disponible'}
        </p>
      </div>
    </div>
  )
}
