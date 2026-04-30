'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  /** Pool of suggested tags from past transactions. Filtered by current input. */
  suggestions?: string[]
  placeholder?: string
  /** Hard cap to keep transactions readable. */
  max?: number
}

const MAX_TAG_LEN = 30
const TAG_DELIMITERS = /[,;\n]/

function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_TAG_LEN)
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Ajouter un tag',
  max = 5,
}: TagInputProps) {
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function commit(rawCandidate: string) {
    const candidate = normalizeTag(rawCandidate)
    if (!candidate) return
    const exists = value.some((t) => t.toLowerCase() === candidate.toLowerCase())
    if (exists) {
      setDraft('')
      return
    }
    if (value.length >= max) return
    onChange([...value, candidate])
    setDraft('')
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
      return
    }
    if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      // Quick path: hit Backspace on empty input to remove the last tag.
      onChange(value.slice(0, -1))
      return
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (TAG_DELIMITERS.test(v)) {
      const parts = v.split(TAG_DELIMITERS)
      const trailing = parts.pop() ?? ''
      parts.forEach(commit)
      setDraft(trailing)
      return
    }
    setDraft(v.slice(0, MAX_TAG_LEN))
  }

  const filteredSuggestions = (() => {
    if (!focused) return []
    const q = draft.trim().toLowerCase()
    const taken = new Set(value.map((t) => t.toLowerCase()))
    return suggestions
      .filter((s) => !taken.has(s.toLowerCase()))
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .slice(0, 5)
  })()

  const atCap = value.length >= max

  return (
    <div className="relative">
      <div
        className="min-h-12 px-2 py-1.5 flex flex-wrap items-center gap-1.5 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#1D9E75] focus-within:border-transparent transition-shadow"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 h-8 pl-2.5 pr-1 rounded-full bg-[#E1F5EE] text-[#085041] text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                remove(tag)
              }}
              aria-label={`Retirer le tag ${tag}`}
              className="w-6 h-6 flex items-center justify-center rounded-full active:bg-[#1D9E75]/10"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 120)
            if (draft) commit(draft)
          }}
          placeholder={atCap ? `Maximum ${max} tags` : value.length === 0 ? placeholder : ''}
          disabled={atCap}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-[80px] h-9 px-1 text-sm bg-transparent focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      {filteredSuggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          role="listbox"
        >
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(s)}
              role="option"
              aria-selected="false"
              className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 active:bg-[#E1F5EE]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
