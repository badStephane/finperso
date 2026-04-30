'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Compte, CompteType } from '@/types'

const TYPE_ICON: Record<CompteType, string> = {
  MOBILE_MONEY: '📱',
  BANQUE: '🏦',
  ESPECES: '💵',
  EPARGNE: '🐷',
}

interface QuickAddProps {
  comptes: Compte[]
}

export function QuickAdd({ comptes }: QuickAddProps) {
  // Daily-use accounts only — savings stay out of the quick row
  const filtered = comptes.filter((c) => c.type !== 'EPARGNE')
  if (filtered.length === 0) return null

  return (
    <div className="mt-5">
      <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Saisie rapide
      </p>
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1"
        role="list"
        aria-label="Comptes pour saisie rapide"
      >
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/transactions/new?compteId=${c.id}`}
            role="listitem"
            aria-label={`Nouvelle dépense sur ${c.name}`}
            className="flex items-center gap-2 h-11 pl-2.5 pr-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors flex-shrink-0"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: c.color + '22' }}
              aria-hidden="true"
            >
              {TYPE_ICON[c.type]}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {c.name}
            </span>
            <Plus
              size={16}
              className="text-[#1D9E75] dark:text-[#2BB68B] -mr-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
