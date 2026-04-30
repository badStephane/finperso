'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Star, Pencil } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import * as compteService from '@/lib/services/compteService'
import { formatCFA } from '@/lib/utils/currency'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Compte, CompteType } from '@/types'

const TYPES: { label: string; value: CompteType }[] = [
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
  { label: 'Banque', value: 'BANQUE' },
  { label: 'Espèces', value: 'ESPECES' },
  { label: 'Épargne', value: 'EPARGNE' },
]

const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD', '#888780']

type SheetMode = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; compte: Compte }

export default function ComptesPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [comptes, setComptes] = useState<Compte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sheet, setSheet] = useState<SheetMode>({ kind: 'closed' })
  const [name, setName] = useState('')
  const [type, setType] = useState<CompteType>('MOBILE_MONEY')
  const [color, setColor] = useState('#1D9E75')
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState<Compte | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const result = await compteService.getComptes(user.uid)
      setComptes(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setName('')
    setType('MOBILE_MONEY')
    setColor('#1D9E75')
    setSheet({ kind: 'create' })
  }

  function openEdit(compte: Compte) {
    setName(compte.name)
    setType(compte.type)
    setColor(compte.color)
    setSheet({ kind: 'edit', compte })
  }

  function closeSheet() {
    setSheet({ kind: 'closed' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setSubmitting(true)
    try {
      if (sheet.kind === 'edit') {
        await compteService.updateCompte(user.uid, sheet.compte.id, {
          name: name.trim(),
          type,
          color,
        })
        toast('Compte modifié', 'success')
      } else {
        await compteService.addCompte(user.uid, { name: name.trim(), type, color })
        toast('Compte ajouté', 'success')
      }
      closeSheet()
      await load()
    } catch (err) {
      console.error('[comptes] save failed', err)
      toast('Échec de l’enregistrement', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!user || !toDelete) return
    setDeleting(true)
    try {
      await compteService.deleteCompte(user.uid, toDelete.id)
      toast('Compte supprimé', 'success')
      setToDelete(null)
      await load()
    } catch {
      toast('Échec de la suppression', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function handleDeleteClick(compte: Compte) {
    if (compte.balance !== 0) {
      toast('Impossible de supprimer un compte avec un solde non nul', 'error')
      return
    }
    setToDelete(compte)
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Mes comptes"
        back
        action={
          <button
            type="button"
            onClick={openCreate}
            aria-label="Ajouter un compte"
            className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-[#E1F5EE] transition-colors"
          >
            <Plus size={22} className="text-[#1D9E75]" />
          </button>
        }
      />

      <div className="mx-4 mt-3">
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : comptes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-8 text-center">
            <p className="text-sm text-gray-500">Aucun compte</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-3 h-11 px-4 bg-[#1D9E75] text-white rounded-lg text-sm font-medium"
            >
              Ajouter mon premier compte
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden stagger-children">
            {comptes.map((c) => (
              <div
                key={c.id}
                className="flex items-stretch border-b border-gray-100 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  aria-label={`Modifier ${c.name}`}
                  className="flex-1 flex items-center justify-between gap-2 px-3 py-3 min-h-[60px] text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                        {c.name}
                        {c.isDefault && (
                          <Star
                            className="w-3.5 h-3.5 text-[#BA7517] fill-current"
                            aria-label="Compte par défaut"
                          />
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {TYPES.find((t) => t.value === c.type)?.label ?? c.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCFA(c.balance)}
                    </span>
                    <Pencil className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  </div>
                </button>
                {!c.isDefault && c.balance === 0 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(c)}
                    className="w-11 flex items-center justify-center text-gray-400 active:text-[#D85A30] active:bg-[#FAECE7] transition-colors"
                    aria-label={`Supprimer ${c.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        open={sheet.kind !== 'closed'}
        onClose={closeSheet}
        title={sheet.kind === 'edit' ? 'Modifier le compte' : 'Nouveau compte'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div>
            <label htmlFor="compte-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du compte
            </label>
            <input
              id="compte-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Wave"
              required
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>
          <div>
            <label htmlFor="compte-type" className="block text-sm font-medium text-gray-700 mb-1.5">
              Type
            </label>
            <select
              id="compte-type"
              value={type}
              onChange={(e) => setType(e.target.value as CompteType)}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Couleur</p>
            <div className="flex gap-3 flex-wrap" role="radiogroup" aria-label="Choisir une couleur">
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
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            aria-busy={submitting}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl text-base font-semibold disabled:opacity-50 active:bg-[#0F6E56] active:scale-[0.99] transition-all"
          >
            {submitting
              ? sheet.kind === 'edit'
                ? 'Enregistrement...'
                : 'Ajout...'
              : sheet.kind === 'edit'
                ? 'Enregistrer'
                : 'Ajouter le compte'}
          </button>
        </form>
      </BottomSheet>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer ce compte ?"
        description={toDelete ? `"${toDelete.name}" sera supprimé. Cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
