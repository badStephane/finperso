'use client'

import type { TransactionType, Category } from '@/types'

interface TransactionFiltersProps {
  activeType?: TransactionType
  activeCategoryId?: string
  categories: Category[]
  onTypeChange: (type?: TransactionType) => void
  onCategoryChange: (categoryId?: string) => void
}

const typeChips: { label: string; value?: TransactionType }[] = [
  { label: 'Tout' },
  { label: 'Dépenses', value: 'DEPENSE' },
  { label: 'Revenus', value: 'REVENU' },
  { label: 'Transferts', value: 'TRANSFERT' },
]

export function TransactionFilterBar({
  activeType,
  activeCategoryId,
  categories,
  onTypeChange,
  onCategoryChange,
}: TransactionFiltersProps) {
  const chipBase =
    'h-9 px-3.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors cursor-pointer flex-shrink-0 inline-flex items-center justify-center min-w-[44px] active:scale-95'

  return (
    <div
      className="flex gap-2 px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide"
      role="toolbar"
      aria-label="Filtres"
    >
      {typeChips.map((chip) => {
        const active = activeType === chip.value && !activeCategoryId
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              onTypeChange(chip.value)
              onCategoryChange(undefined)
            }}
            aria-pressed={active}
            className={`${chipBase} ${
              active
                ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#085041]'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            {chip.label}
          </button>
        )
      })}
      <div className="w-px bg-gray-200 flex-shrink-0 mx-0.5 self-stretch" aria-hidden="true" />
      {categories.map((cat) => {
        const active = activeCategoryId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              onCategoryChange(active ? undefined : cat.id)
              onTypeChange(undefined)
            }}
            aria-pressed={active}
            className={`${chipBase} gap-1.5 ${
              active
                ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#085041]'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
