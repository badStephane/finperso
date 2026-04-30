'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="px-4 pt-3 bg-white">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Rechercher une transaction'}
          aria-label="Rechercher dans les transactions"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full h-11 pl-10 pr-11 text-base border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Effacer la recherche"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 active:text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
