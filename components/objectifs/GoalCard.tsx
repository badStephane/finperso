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
  const pct = objectif.targetAmount > 0
    ? Math.round((objectif.currentAmount / objectif.targetAmount) * 100)
    : 0

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer active:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: objectif.color + '20' }}
        >
          {objectif.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{objectif.name}</p>
          {objectif.deadline && (
            <p className="text-[10px] text-gray-500">
              Objectif : {format(objectif.deadline.toDate(), 'MMM yyyy', { locale: fr })}
            </p>
          )}
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: pct >= 80 ? '#0F6E56' : objectif.color }}
        >
          {pct}%
        </span>
      </div>
      <ProgressBar value={objectif.currentAmount} max={objectif.targetAmount} color={objectif.color} />
      <div className="flex justify-between mt-2 text-[10px] text-gray-500">
        <span>{formatCFA(objectif.currentAmount)} épargnés</span>
        <span>{formatCFA(objectif.targetAmount)} cible</span>
      </div>
    </div>
  )
}
