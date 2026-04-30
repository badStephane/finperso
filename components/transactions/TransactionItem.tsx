'use client'

import { useState, useRef } from 'react'
import { formatCFA } from '@/lib/utils/currency'
import type { Transaction } from '@/types'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface TransactionItemProps {
  transaction: Transaction
  onDelete: (transaction: Transaction) => void
}

export function TransactionItem({ transaction: tx, onDelete }: TransactionItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
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

  function handleConfirmDelete() {
    onDelete(tx)
    setConfirmOpen(false)
    setSwiped(false)
  }

  return (
    <>
      <div className="relative overflow-hidden" role="listitem">
        {swiped && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Supprimer la transaction"
            className="absolute right-0 top-0 bottom-0 w-20 bg-[#D85A30] flex items-center justify-center text-white cursor-pointer hover:bg-[#993C1D] transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
        <div
          className={`flex items-center gap-3 px-3 py-3 bg-white min-h-[60px] transition-transform duration-200 ease-out ${
            swiped ? '-translate-x-20' : ''
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: tx.type === 'TRANSFERT' ? '#F3F4F6' : '#E1F5EE' }}
            aria-hidden="true"
          >
            {tx.categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {tx.note || tx.categoryName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {tx.type === 'TRANSFERT'
                ? `${tx.compteName} → ${tx.toCompteName ?? '?'}`
                : `${tx.categoryName} · ${tx.compteName}`}
            </p>
          </div>
          <span
            className={`text-sm font-semibold whitespace-nowrap tabular-nums shrink-0 ${
              tx.type === 'DEPENSE'
                ? 'text-[#993C1D]'
                : tx.type === 'REVENU'
                  ? 'text-[#0F6E56]'
                  : 'text-gray-700'
            }`}
            aria-label={
              tx.type === 'DEPENSE'
                ? `Dépense de ${formatCFA(tx.amount)}`
                : tx.type === 'REVENU'
                  ? `Revenu de ${formatCFA(tx.amount)}`
                  : `Transfert de ${formatCFA(tx.amount)}`
            }
          >
            {tx.type === 'DEPENSE' ? '−' : tx.type === 'REVENU' ? '+' : ''}
            {formatCFA(tx.amount)}
          </span>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer cette transaction ?"
        description={`${tx.note || tx.categoryName} — ${formatCFA(tx.amount)}`}
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
