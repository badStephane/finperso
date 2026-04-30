'use client'

import { useState } from 'react'
import { useObjectifs } from '@/hooks/useObjectifs'

interface ContributionFormProps {
  objectifId: string
  onDone: () => void
}

export function ContributionForm({ objectifId, onDone }: ContributionFormProps) {
  const { addContribution } = useObjectifs()
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
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="Montant"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optionnel)"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !amount}
        className="h-10 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        +
      </button>
    </form>
  )
}
