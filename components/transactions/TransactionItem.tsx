'use client'

import { useState, useRef } from 'react'
import { formatCFA } from '@/lib/utils/currency'
import type { Transaction } from '@/types'
import { Trash2 } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
  onDelete: (transaction: Transaction) => void
}

export function TransactionItem({ transaction: tx, onDelete }: TransactionItemProps) {
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isHorizontal = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isHorizontal.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - startX.current)
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    if (dx > 10 && dx > dy) isHorizontal.current = true
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isHorizontal.current) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 60) setSwiped(true)
    else if (diff < -30) setSwiped(false)
  }

  function handleDelete() {
    if (confirm('Supprimer cette transaction ?')) {
      onDelete(tx)
      setSwiped(false)
    }
  }

  return (
    <div className="relative overflow-hidden" role="listitem">
      {swiped && (
        <button
          onClick={handleDelete}
          aria-label="Supprimer la transaction"
          className="absolute right-0 top-0 bottom-0 w-16 bg-[#D85A30] flex items-center justify-center text-white cursor-pointer hover:bg-[#993C1D] transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )}
      <div
        className={`flex items-center gap-3 px-3 py-2.5 bg-white transition-transform duration-200 ease-out ${
          swiped ? '-translate-x-16' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: '#E1F5EE' }}
          aria-hidden="true"
        >
          {tx.categoryIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">
            {tx.note || tx.categoryName}
          </p>
          <p className="text-[10px] text-gray-500">
            {tx.categoryName} · {tx.compteName}
          </p>
        </div>
        <span
          className={`text-sm font-medium whitespace-nowrap ${
            tx.type === 'DEPENSE' ? 'text-[#993C1D]' : 'text-[#0F6E56]'
          }`}
          aria-label={`${tx.type === 'DEPENSE' ? 'Dépense' : 'Revenu'} de ${formatCFA(tx.amount)}`}
        >
          {tx.type === 'DEPENSE' ? '-' : '+'}
          {formatCFA(tx.amount)}
        </span>
      </div>
    </div>
  )
}
