'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useObjectifs } from '@/hooks/useObjectifs'
import { useToastStore } from '@/stores/toastStore'

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

interface ContributionFormProps {
  objectifId: string
  onDone: () => void
}

export function ContributionForm({ objectifId, onDone }: ContributionFormProps) {
  const { addContribution } = useObjectifs()
  const showToast = useToastStore((s) => s.show)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return

    setSubmitting(true)
    try {
      await addContribution(objectifId, {
        amount: parseInt(amount),
        note: note.trim() || null,
      })
      setAmount('')
      setNote('')
      showToast('Contribution ajoutée', 'success')
      onDone()
    } catch {
      showToast('Échec de l’ajout', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="contrib-amount" className="block text-sm font-medium text-gray-700 mb-1.5">
          Montant
        </label>
        <input
          id="contrib-amount"
          type="text"
          inputMode="numeric"
          value={formatThousands(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="50 000"
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
        />
      </div>
      <div>
        <label htmlFor="contrib-note" className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          id="contrib-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: salaire de mai"
          className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !amount}
        aria-busy={submitting}
        className="w-full h-12 inline-flex items-center justify-center gap-1.5 bg-[#1D9E75] text-white rounded-xl text-base font-semibold disabled:opacity-50 active:bg-[#0F6E56] active:scale-[0.99] transition-all"
      >
        <Plus className="w-5 h-5" />
        {submitting ? 'Ajout...' : 'Ajouter'}
      </button>
    </form>
  )
}
