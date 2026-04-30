'use client'

import { useState } from 'react'
import { useObjectifs } from '@/hooks/useObjectifs'
import { useToastStore } from '@/stores/toastStore'

const ICONS = ['🏦', '✈️', '🏍️', '📱', '🏠', '🎓', '💍', '🚗', '🎯', '💎']
const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD']

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

interface GoalFormProps {
  onClose: () => void
}

export function GoalForm({ onClose }: GoalFormProps) {
  const { create } = useObjectifs()
  const showToast = useToastStore((s) => s.show)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#1D9E75')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !targetAmount) return

    setSubmitting(true)
    try {
      await create({
        name,
        targetAmount: parseInt(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        icon,
        color,
      })
      showToast('Objectif créé', 'success')
      onClose()
    } catch {
      setError('Échec de la création. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom de l&apos;objectif
        </label>
        <input
          id="goal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fonds d'urgence"
          required
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>

      <div>
        <label htmlFor="goal-amount" className="block text-sm font-medium text-gray-700 mb-1.5">
          Montant cible (F CFA)
        </label>
        <input
          id="goal-amount"
          type="text"
          inputMode="numeric"
          value={formatThousands(targetAmount)}
          onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="500 000"
          required
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
        />
      </div>

      <div>
        <label htmlFor="goal-deadline" className="block text-sm font-medium text-gray-700 mb-1.5">
          Date limite <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          id="goal-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Icône</p>
        <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Choisir une icône">
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={icon === i}
              aria-label={`Icône ${i}`}
              onClick={() => setIcon(i)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2 transition-colors active:scale-95 ${
                icon === i
                  ? 'border-[#1D9E75] bg-[#E1F5EE]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Couleur</p>
        <div className="flex gap-3" role="radiogroup" aria-label="Choisir une couleur">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={`Couleur ${c}`}
              onClick={() => setColor(c)}
              className="relative w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <span
                className="block w-9 h-9 rounded-full"
                style={{ backgroundColor: c }}
              />
              {color === c && (
                <span
                  className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-gray-900"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="px-3 py-2.5 rounded-lg bg-[#FAECE7] text-sm text-[#993C1D]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !name || !targetAmount}
        aria-busy={submitting}
        className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-semibold text-base active:bg-[#0F6E56] active:scale-[0.99] disabled:opacity-50 transition-all"
      >
        {submitting ? 'Création...' : "Créer l'objectif"}
      </button>
    </form>
  )
}
