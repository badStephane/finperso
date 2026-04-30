'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { useComptes } from '@/hooks/useComptes'
import { useTransactions } from '@/hooks/useTransactions'
import type { TransactionType } from '@/types'

export function TransactionForm() {
  const router = useRouter()
  const { add } = useTransactions()
  const [type, setType] = useState<TransactionType>('DEPENSE')
  const { categories } = useCategories(type)
  const { comptes } = useComptes()

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [compteId, setCompteId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedCompte = comptes.find((c) => c.id === compteId)

  // Auto-select default compte
  useEffect(() => {
    if (!compteId && comptes.length > 0) {
      const defaultCompte = comptes.find((c) => c.isDefault) ?? comptes[0]
      setCompteId(defaultCompte.id)
    }
  }, [comptes, compteId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCategory || !selectedCompte || !amount) return

    setSubmitting(true)
    try {
      await add({
        amount: parseInt(amount),
        type,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        compteId: selectedCompte.id,
        compteName: selectedCompte.name,
        date: new Date(date),
        note: note.trim() || null,
      })
      router.back()
    } catch {
      // toast handled by hook
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      {/* Type toggle */}
      <div className="flex mx-4 mt-4 bg-gray-100 rounded-xl p-1" role="radiogroup" aria-label="Type de transaction">
        {(['DEPENSE', 'REVENU'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => {
              setType(t)
              setCategoryId('')
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              type === t
                ? t === 'DEPENSE'
                  ? 'bg-white text-[#993C1D] shadow-sm'
                  : 'bg-white text-[#0F6E56] shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {t === 'DEPENSE' ? 'Dépense' : 'Revenu'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="px-4 mt-6 text-center">
        <label htmlFor="amount" className="sr-only">Montant</label>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '')
            setAmount(v)
          }}
          placeholder="0"
          autoFocus
          className="text-[32px] font-medium text-center w-full bg-transparent focus:outline-none text-gray-900"
        />
        <p className="text-sm text-gray-400 mt-1">F CFA</p>
      </div>

      {/* Categories grid */}
      <div className="px-4 mt-6">
        <p className="text-xs text-gray-500 mb-2">Catégorie</p>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Catégorie">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={categoryId === cat.id}
              aria-label={cat.name}
              onClick={() => setCategoryId(cat.id)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors cursor-pointer min-h-[60px] ${
                categoryId === cat.id
                  ? 'border-[#1D9E75] bg-[#E1F5EE]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-lg" aria-hidden="true">{cat.icon}</span>
              <span className="text-[10px] text-gray-700 truncate w-full text-center px-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date & Compte & Note */}
      <div className="px-4 mt-6 space-y-3">
        <div>
          <label htmlFor="tx-date" className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
        </div>

        <div>
          <label htmlFor="tx-compte" className="block text-xs text-gray-500 mb-1">Compte</label>
          <select
            id="tx-compte"
            value={compteId}
            onChange={(e) => setCompteId(e.target.value)}
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] cursor-pointer"
          >
            {comptes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-note" className="block text-xs text-gray-500 mb-1">Note (optionnel)</label>
          <input
            id="tx-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Marché Sandaga"
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 mt-auto py-4">
        <button
          type="submit"
          disabled={submitting || !amount || !categoryId || !compteId}
          className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-medium text-base active:bg-[#0F6E56] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
