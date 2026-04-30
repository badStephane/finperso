'use client'

import { useToastStore } from '@/stores/toastStore'
import { CheckCircle, XCircle } from 'lucide-react'

export function Toast() {
  const { message, type } = useToastStore()

  if (!message) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[100] flex justify-center pointer-events-none animate-[slideUp_200ms_ease-out]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto ${
          type === 'success'
            ? 'bg-[#085041] text-[#E1F5EE]'
            : 'bg-[#993C1D] text-[#FAECE7]'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={16} aria-hidden="true" />
        ) : (
          <XCircle size={16} aria-hidden="true" />
        )}
        {message}
      </div>
    </div>
  )
}
