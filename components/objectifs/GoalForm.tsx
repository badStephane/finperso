'use client'

import { useState } from 'react'
import { useObjectifs } from '@/hooks/useObjectifs'

const ICONS = ['🏦', '✈️', '🏍️', '📱', '🏠', '🎓', '💍', '🚗', '🎯', '💎']
const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD']

interface GoalFormProps {
  onClose: () => void
}

export function GoalForm({ onClose }: GoalFormProps) {
  const { create } = useObjectifs()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#1D9E75')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nom de l&apos;objectif</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fonds d'urgence"
          required
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Montant cible (F CFA)</label>
        <input
          type="text"
          inputMode="numeric"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="500 000"
          required
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Date limite (optionnel)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Icône</label>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${
                icon === i ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-gray-200'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Couleur</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === c ? 'border-gray-900' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !name || !targetAmount}
        className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-medium text-base active:bg-[#0F6E56] disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Création...' : 'Créer l\'objectif'}
      </button>
    </form>
  )
}
