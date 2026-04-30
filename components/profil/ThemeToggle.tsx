'use client'

import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemePreference } from '@/lib/utils/theme'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'auto', label: 'Auto', Icon: SunMoon },
  { value: 'dark', label: 'Sombre', Icon: Moon },
]

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div
      className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1"
      role="radiogroup"
      aria-label="Apparence"
    >
      {OPTIONS.map((opt) => {
        const active = preference === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(opt.value)}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              active
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <opt.Icon size={14} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
