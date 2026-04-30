'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add('no-scroll')
    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={loading ? undefined : onCancel}
        className="absolute inset-0 bg-black/50"
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />
      <div
        className="relative w-full sm:max-w-sm bg-white rounded-2xl shadow-xl p-5"
        style={{
          animation: 'sheetUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <h2 id="confirm-title" className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className={`flex-1 h-12 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-60 active:scale-[0.98] transition-transform ${
              destructive ? 'bg-[#D85A30]' : 'bg-[#1D9E75]'
            }`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
