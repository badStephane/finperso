'use client'

import { useToastStore } from '@/stores/toastStore'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function Toast() {
  const { message, type, hide } = useToastStore()

  if (!message) return null

  return (
    <div
      className="fixed left-1/2 z-[100] pointer-events-none px-4 max-w-sm w-full"
      style={{
        bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        transform: 'translateX(-50%)',
        animation: 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
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
          <CheckCircle size={18} aria-hidden="true" className="shrink-0" />
        ) : (
          <XCircle size={18} aria-hidden="true" className="shrink-0" />
        )}
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={hide}
          aria-label="Fermer"
          className="-mr-1 w-7 h-7 flex items-center justify-center rounded-md opacity-80 active:opacity-100 active:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
