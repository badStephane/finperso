'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRecurrences } from '@/hooks/useRecurrences'
import { useCategories } from '@/hooks/useCategories'
import { useComptes } from '@/hooks/useComptes'
import { formatCFA } from '@/lib/utils/currency'
import { PageHeader } from '@/components/ui/PageHeader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import type { Recurrence } from '@/types'

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function RecurrencesPage() {
  const { recurrences, loading, add, remove, toggle } = useRecurrences()
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState<Recurrence | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<'DEPENSE' | 'REVENU'>('DEPENSE')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [compteId, setCompteId] = useState('')
  const [note, setNote] = useState('')
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { categories } = useCategories(type)
  const { comptes } = useComptes()
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedCompte = comptes.find((c) => c.id === compteId)

  useEffect(() => {
    if (!compteId && comptes.length > 0) {
      const def = comptes.find((c) => c.isDefault) ?? comptes[0]
      setCompteId(def.id)
    }
  }, [comptes, compteId])

  function resetForm() {
    setName('')
    setType('DEPENSE')
    setAmount('')
    setCategoryId('')
    setNote('')
    setNextDueDate(new Date().toISOString().split('T')[0])
    setError(null)
  }

  const missing = !name.trim()
    ? 'Donnez un nom'
    : !amount || amount === '0'
      ? 'Saisissez un montant'
      : !categoryId
        ? 'Choisissez une catégorie'
        : !compteId
          ? 'Choisissez un compte'
          : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedCategory || !selectedCompte || missing) return
    setSubmitting(true)
    try {
      const due = new Date(nextDueDate)
      await add({
        name: name.trim(),
        amount: parseInt(amount),
        type,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        compteId: selectedCompte.id,
        compteName: selectedCompte.name,
        note: note.trim() || null,
        frequency: 'MONTHLY',
        dayOfMonth: due.getDate(),
        nextDueDate: due,
        active: true,
      })
      setShowForm(false)
      resetForm()
    } catch {
      setError('Échec de l’enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Récurrences"
        back
        action={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            aria-label="Ajouter une récurrence"
            disabled={comptes.length === 0}
            className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-[#E1F5EE] transition-colors disabled:opacity-40"
          >
            <Plus size={22} className="text-[#1D9E75]" />
          </button>
        }
      />

      <div className="mx-4 mt-3 flex-1">
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recurrences.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Aucune récurrence"
            description="Automatisez votre salaire, votre loyer ou vos abonnements."
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {recurrences.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-b-0 min-h-[60px]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: '#E1F5EE' }}
                  aria-hidden="true"
                >
                  {rec.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{rec.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Le {rec.dayOfMonth} · {rec.compteName} ·{' '}
                    {rec.active
                      ? `prochaine ${format(rec.nextDueDate.toDate(), 'd MMM', { locale: fr })}`
                      : 'en pause'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      rec.type === 'DEPENSE' ? 'text-[#993C1D]' : 'text-[#0F6E56]'
                    }`}
                  >
                    {rec.type === 'DEPENSE' ? '−' : '+'}
                    {formatCFA(rec.amount)}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rec.active}
                    aria-label={rec.active ? 'Mettre en pause' : 'Activer'}
                    onClick={() => toggle(rec)}
                    className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                      rec.active ? 'bg-[#1D9E75]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        rec.active ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(rec)}
                    aria-label={`Supprimer ${rec.name}`}
                    className="w-11 h-11 flex items-center justify-center text-gray-400 active:text-[#D85A30] active:bg-[#FAECE7] rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {comptes.length === 0 && !loading && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Créez d’abord un compte dans{' '}
            <Link href="/profil/comptes" className="text-[#1D9E75] underline">
              Mes comptes
            </Link>
            .
          </p>
        )}
      </div>

      <BottomSheet
        open={showForm}
        onClose={() => {
          setShowForm(false)
          resetForm()
        }}
        title="Nouvelle récurrence"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div>
            <label htmlFor="rec-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom
            </label>
            <input
              id="rec-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Loyer, Salaire, Netflix"
              required
              maxLength={40}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1" role="radiogroup" aria-label="Type">
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
                className={`flex-1 min-h-[44px] text-sm font-semibold rounded-lg transition-colors ${
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

          <div>
            <label htmlFor="rec-amount" className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant
            </label>
            <div className="relative">
              <input
                id="rec-amount"
                type="text"
                inputMode="numeric"
                value={formatThousands(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full h-12 px-4 pr-12 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                F
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Catégorie</p>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 text-center">
                Aucune catégorie de {type === 'DEPENSE' ? 'dépense' : 'revenu'}.
              </p>
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
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-colors min-h-[68px] active:scale-95 ${
                      categoryId === cat.id
                        ? 'border-[#1D9E75] bg-[#E1F5EE]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-lg" aria-hidden="true">
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

          <div>
            <label htmlFor="rec-compte" className="block text-sm font-medium text-gray-700 mb-1.5">
              Compte
            </label>
            <select
              id="rec-compte"
              value={compteId}
              onChange={(e) => setCompteId(e.target.value)}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            >
              {comptes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rec-date" className="block text-sm font-medium text-gray-700 mb-1.5">
              Première échéance
            </label>
            <input
              id="rec-date"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se répète chaque mois au même jour.
            </p>
          </div>

          <div>
            <label htmlFor="rec-note" className="block text-sm font-medium text-gray-700 mb-1.5">
              Note <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="rec-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          {error && (
            <div role="alert" className="px-3 py-2.5 rounded-lg bg-[#FAECE7] text-sm text-[#993C1D]">
              {error}
            </div>
          )}
          {missing && !submitting && (
            <p className="text-xs text-gray-500 text-center">{missing}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !!missing}
            aria-busy={submitting}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl text-base font-semibold disabled:opacity-50 active:bg-[#0F6E56] active:scale-[0.99] transition-all"
          >
            {submitting ? 'Enregistrement...' : 'Créer la récurrence'}
          </button>
        </form>
      </BottomSheet>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cette récurrence ?"
        description={
          toDelete
            ? `"${toDelete.name}" ne sera plus créée automatiquement. Les transactions déjà enregistrées sont conservées.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (toDelete) remove(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
