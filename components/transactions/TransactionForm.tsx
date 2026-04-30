'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'
import { useComptes } from '@/hooks/useComptes'
import { useTransactions } from '@/hooks/useTransactions'
import { useToastStore } from '@/stores/toastStore'
import type { TransactionType } from '@/types'

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function TransactionForm() {
  const router = useRouter()
  const { add } = useTransactions()
  const showToast = useToastStore((s) => s.show)
  const [type, setType] = useState<TransactionType>('DEPENSE')
  const { categories } = useCategories(type)
  const { comptes } = useComptes()

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [compteId, setCompteId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedCompte = comptes.find((c) => c.id === compteId)

  useEffect(() => {
    if (!compteId && comptes.length > 0) {
      const defaultCompte = comptes.find((c) => c.isDefault) ?? comptes[0]
      setCompteId(defaultCompte.id)
    }
  }, [comptes, compteId])

  const missing = useMemo(() => {
    if (!amount || amount === '0') return 'Saisissez un montant'
    if (!categoryId) return 'Choisissez une catégorie'
    if (!compteId) return 'Choisissez un compte'
    return null
  }, [amount, categoryId, compteId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
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
      showToast('Transaction enregistrée', 'success')
      router.back()
    } catch {
      setError('Échec de l’enregistrement. Vérifiez votre connexion et réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  if (comptes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
        <p className="text-base font-medium text-gray-900">Créez d’abord un compte</p>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Vous avez besoin d’au moins un compte pour enregistrer une transaction.
        </p>
        <Link
          href="/profil/comptes"
          className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-lg bg-[#1D9E75] text-white text-sm font-medium active:scale-[0.98] transition-transform"
        >
          Gérer mes comptes
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      <div
        className="flex mx-4 mt-4 bg-gray-100 rounded-xl p-1"
        role="radiogroup"
        aria-label="Type de transaction"
      >
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
            className={`flex-1 min-h-[44px] text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
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

      <div className="px-4 mt-6 text-center">
        <label htmlFor="amount" className="sr-only">
          Montant
        </label>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          value={formatThousands(amount)}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '')
            setAmount(v)
          }}
          placeholder="0"
          className="text-[36px] font-semibold text-center w-full bg-transparent focus:outline-none text-gray-900 tabular-nums tracking-tight"
        />
        <p className="text-sm text-gray-400 mt-1">F CFA</p>
      </div>

      <div className="px-4 mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Catégorie</p>
        {categories.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
            Aucune catégorie de {type === 'DEPENSE' ? 'dépense' : 'revenu'}.{' '}
            <Link href="/profil/categories" className="text-[#1D9E75] font-medium underline">
              Créer
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Catégorie">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={categoryId === cat.id}
                aria-label={cat.name}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-colors cursor-pointer min-h-[72px] active:scale-95 ${
                  categoryId === cat.id
                    ? 'border-[#1D9E75] bg-[#E1F5EE]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="text-xl" aria-hidden="true">
                  {cat.icon}
                </span>
                <span className="text-xs text-gray-700 truncate w-full text-center px-1 leading-tight">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-6 space-y-3">
        <div>
          <label htmlFor="tx-date" className="block text-sm font-medium text-gray-700 mb-1.5">
            Date
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
        </div>

        <div>
          <label htmlFor="tx-compte" className="block text-sm font-medium text-gray-700 mb-1.5">
            Compte
          </label>
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
          <label htmlFor="tx-note" className="block text-sm font-medium text-gray-700 mb-1.5">
            Note <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
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

      {error && (
        <div
          role="alert"
          className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-[#FAECE7] text-sm text-[#993C1D]"
        >
          {error}
        </div>
      )}

      <div
        className="sticky bottom-0 px-4 pt-3 pb-4 mt-6 bg-white/95 backdrop-blur border-t border-gray-100"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {missing && !submitting && (
          <p className="text-xs text-gray-500 text-center mb-2">{missing}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !!missing}
          aria-busy={submitting}
          className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-semibold text-base active:bg-[#0F6E56] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
