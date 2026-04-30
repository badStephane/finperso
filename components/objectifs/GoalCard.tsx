'use client'

import { formatCFA } from '@/lib/utils/currency'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Objectif } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface GoalCardProps {
  objectif: Objectif
  onClick?: () => void
}

export function GoalCard({ objectif, onClick }: GoalCardProps) {
  const pct =
    objectif.targetAmount > 0
      ? Math.round((objectif.currentAmount / objectif.targetAmount) * 100)
      : 0

  const tintBg = `${objectif.color}1A`

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: tintBg }}
          aria-hidden="true"
        >
          {objectif.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{objectif.name}</p>
          {objectif.deadline && (
            <p className="text-xs text-gray-500 mt-0.5">
              Objectif : {format(objectif.deadline.toDate(), 'MMM yyyy', { locale: fr })}
            </p>
          )}
        </div>
        <span
          className="text-base font-semibold tabular-nums shrink-0"
          style={{ color: pct >= 80 ? '#0F6E56' : objectif.color }}
        >
          {pct}%
        </span>
      </div>
      <ProgressBar
        value={objectif.currentAmount}
        max={objectif.targetAmount}
        color={objectif.color}
      />
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className="tabular-nums">{formatCFA(objectif.currentAmount)} épargnés</span>
        <span className="tabular-nums">{formatCFA(objectif.targetAmount)} cible</span>
      </div>
    </button>
  )
}
