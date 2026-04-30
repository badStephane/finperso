'use client'

import { useState } from 'react'
import { Check, X, Pencil } from 'lucide-react'
import { formatCFA } from '@/lib/utils/currency'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Budget } from '@/types'

interface CategoryBudgetItemProps {
  budget: Budget
  onUpdate: (amount: number) => void
}

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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

  function handleCancel() {
    setNewAmount(budget.amount.toString())
    setEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: '#E1F5EE' }}
            aria-hidden="true"
          >
            {budget.categoryIcon}
          </div>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={formatThousands(newAmount)}
              onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
              aria-label={`Budget pour ${budget.categoryName}`}
              className="flex-1 min-w-0 h-11 px-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium text-gray-900 truncate">
              {budget.categoryName}
            </span>
          )}
        </div>
        {editing ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              aria-label="Enregistrer"
              className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#1D9E75] text-white active:bg-[#0F6E56] transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Annuler"
              className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 active:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Modifier le budget ${budget.categoryName}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-2 -mr-2 min-h-[44px] active:bg-gray-50 rounded-md"
          >
            <span className="text-right">
              <span className="block text-sm font-semibold text-gray-900 tabular-nums">
                {formatCFA(budget.spent)}
              </span>
              <span className="block text-xs text-gray-500 tabular-nums">
                / {formatCFA(budget.amount)}
              </span>
            </span>
            <Pencil className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>
      <ProgressBar value={budget.spent} max={budget.amount} />
    </div>
  )
}
