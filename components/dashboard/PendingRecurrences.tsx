'use client'

import { useState } from 'react'
import { Bell, Check, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRecurrences } from '@/hooks/useRecurrences'
import { formatCFA } from '@/lib/utils/currency'
import { BottomSheet } from '@/components/ui/BottomSheet'
import type { Recurrence } from '@/types'

export function PendingRecurrences() {
  const { due, confirm, skip } = useRecurrences()
  const [open, setOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  if (due.length === 0) return null

  const total = due.reduce((sum, r) => sum + (r.type === 'DEPENSE' ? -r.amount : r.amount), 0)

  async function handleConfirm(rec: Recurrence) {
    setBusyId(rec.id)
    try {
      await confirm(rec)
    } catch {
      // toast handled in hook
    } finally {
      setBusyId(null)
    }
  }

  async function handleSkip(rec: Recurrence) {
    setBusyId(rec.id)
    try {
      await skip(rec)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-3 mt-3 w-[calc(100%-1.5rem)] flex items-center gap-3 px-4 py-3 bg-[#FAEEDA] border border-[#E5C58E] rounded-xl active:scale-[0.99] transition-transform"
      >
        <span
          className="w-9 h-9 rounded-full bg-[#BA7517] flex items-center justify-center text-white flex-shrink-0"
          aria-hidden="true"
        >
          <Bell size={16} />
        </span>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-[#5C3A0F]">
            {due.length} échéance{due.length > 1 ? 's' : ''} à valider
          </p>
          <p className="text-xs text-[#7B5119] tabular-nums truncate">
            {total >= 0 ? '+' : '−'}
            {formatCFA(Math.abs(total))} au total
          </p>
        </div>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Échéances à valider">
        <div className="space-y-2 pb-2">
          {due.map((rec) => (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-xl p-3 bg-white"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: '#E1F5EE' }}
                  aria-hidden="true"
                >
                  {rec.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{rec.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {rec.compteName} ·{' '}
                    {format(rec.nextDueDate.toDate(), 'd MMM', { locale: fr })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    rec.type === 'DEPENSE' ? 'text-[#993C1D]' : 'text-[#0F6E56]'
                  }`}
                >
                  {rec.type === 'DEPENSE' ? '−' : '+'}
                  {formatCFA(rec.amount)}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleSkip(rec)}
                  disabled={busyId === rec.id}
                  className="flex-1 h-11 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Clock size={16} />
                  Passer
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(rec)}
                  disabled={busyId === rec.id}
                  aria-busy={busyId === rec.id}
                  className="flex-1 h-11 rounded-lg bg-[#1D9E75] text-sm font-semibold text-white active:bg-[#0F6E56] disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  {busyId === rec.id ? '...' : 'Valider'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
