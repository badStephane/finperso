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
]

export function TransactionFilterBar({
  activeType,
  activeCategoryId,
  categories,
  onTypeChange,
  onCategoryChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex gap-2 px-4 py-2.5 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide" role="toolbar" aria-label="Filtres">
      {typeChips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => {
            onTypeChange(chip.value)
            onCategoryChange(undefined)
          }}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors cursor-pointer flex-shrink-0 ${
            activeType === chip.value && !activeCategoryId
              ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#085041]'
              : 'bg-transparent border-gray-200 text-gray-500'
          }`}
        >
          {chip.label}
        </button>
      ))}
      <div className="w-px bg-gray-200 flex-shrink-0 my-0.5" />
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            onCategoryChange(activeCategoryId === cat.id ? undefined : cat.id)
            onTypeChange(undefined)
          }}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors cursor-pointer flex-shrink-0 ${
            activeCategoryId === cat.id
              ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#085041]'
              : 'bg-transparent border-gray-200 text-gray-500'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}
