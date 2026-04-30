'use client'

import { useEffect, useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useTransactions } from '@/hooks/useTransactions'
import { useToastStore } from '@/stores/toastStore'
import { formatCFA } from '@/lib/utils/currency'
import type { Transaction } from '@/types'

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

interface TransactionEditSheetProps {
  transaction: Transaction | null
  onClose: () => void
  onSaved?: () => void
}

export function TransactionEditSheet({
  transaction,
  onClose,
  onSaved,
}: TransactionEditSheetProps) {
  const { update } = useTransactions()
  const showToast = useToastStore((s) => s.show)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!transaction) return
    setAmount(String(transaction.amount))
    setNote(transaction.note ?? '')
    setError(null)
  }, [transaction])

  const open = transaction !== null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!transaction) return
    const value = parseInt(amount)
    if (!value || value <= 0) {
      setError('Saisissez un montant supérieur à 0')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await update(transaction, { amount: value, note: note.trim() || null })
      showToast('Transaction modifiée', 'success')
      onSaved?.()
      onClose()
    } catch {
      setError('Échec de la modification. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Modifier la transaction">
      {transaction && (
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{
                backgroundColor:
                  transaction.type === 'TRANSFERT' ? '#F3F4F6' : '#E1F5EE',
              }}
              aria-hidden="true"
            >
              {transaction.categoryIcon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.categoryName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {transaction.compteName}
                {transaction.toCompteName ? ` → ${transaction.toCompteName}` : ''}
                {' · '}
                {transaction.date.toDate().toLocaleDateString('fr')}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-amount"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Montant (F CFA)
            </label>
            <input
              id="edit-amount"
              type="text"
              inputMode="numeric"
              value={formatThousands(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
            />
            {transaction.amount !== parseInt(amount || '0') && amount && (
              <p className="text-xs text-gray-500 mt-1.5">
                Précédent : {formatCFA(transaction.amount)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-note"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Note <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="edit-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Marché Sandaga"
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          <p className="text-xs text-gray-400 px-1 leading-relaxed">
            Pour changer le compte, le type ou la catégorie, supprimez cette
            transaction et créez-en une nouvelle.
          </p>

          {error && (
            <div
              role="alert"
              className="px-3 py-2.5 rounded-lg bg-[#FAECE7] text-sm text-[#993C1D]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !amount}
            aria-busy={submitting}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl text-base font-semibold disabled:opacity-50 active:bg-[#0F6E56] active:scale-[0.99] transition-all"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}
    </BottomSheet>
  )
}
