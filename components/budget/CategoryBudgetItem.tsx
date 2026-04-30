'use client'

import { useState } from 'react'
import { formatCFA } from '@/lib/utils/currency'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Budget } from '@/types'

interface CategoryBudgetItemProps {
  budget: Budget
  onUpdate: (amount: number) => void
}

export function CategoryBudgetItem({ budget, onUpdate }: CategoryBudgetItemProps) {
  const [editing, setEditing] = useState(false)
  const [newAmount, setNewAmount] = useState(budget.amount.toString())

  function handleSave() {
    const val = parseInt(newAmount)
    if (val > 0) {
      onUpdate(val)
    }
    setEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
            style={{ backgroundColor: '#E1F5EE' }}
          >
            {budget.categoryIcon}
          </div>
          <span className="text-sm text-gray-900">{budget.categoryName}</span>
        </div>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
              className="w-20 h-7 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="text-xs text-[#1D9E75] font-medium px-2"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500"
          >
            <span className="font-medium text-gray-900">{formatCFA(budget.spent)}</span>
            {' / '}
            {formatCFA(budget.amount)}
          </button>
        )}
      </div>
      <ProgressBar value={budget.spent} max={budget.amount} />
    </div>
  )
}
