'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retrying?: boolean
}

export function ErrorState({
  title = 'Connexion interrompue',
  description = "Impossible de charger les données. Vérifiez votre connexion et réessayez.",
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#FAECE7] flex items-center justify-center mb-4">
        <WifiOff className="w-7 h-7 text-[#993C1D]" strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          aria-busy={retrying}
          className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#1D9E75] text-white text-sm font-medium active:scale-[0.98] disabled:opacity-60 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          Réessayer
        </button>
      )}
    </div>
  )
}
