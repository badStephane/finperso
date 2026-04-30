'use client'

import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Optional max height, defaults to 90vh */
  maxHeight?: string
}

export function BottomSheet({ open, onClose, title, children, maxHeight = '90vh' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const currentY = useRef(0)

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
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0 && sheetRef.current) {
      currentY.current = dy
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }

  const handleTouchEnd = () => {
    if (startY.current === null) return
    if (sheetRef.current) {
      sheetRef.current.style.transform = ''
      sheetRef.current.style.transition = 'transform 200ms ease-out'
      setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transition = ''
      }, 220)
    }
    if (currentY.current > 80) onClose()
    startY.current = null
    currentY.current = 0
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-end"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />
      <div
        ref={sheetRef}
        className="relative w-full bg-white rounded-t-2xl shadow-xl flex flex-col"
        style={{
          maxHeight,
          animation: 'sheetUp 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-2 flex flex-col items-center cursor-grab touch-none"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {title && (
          <div className="px-5 pb-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
