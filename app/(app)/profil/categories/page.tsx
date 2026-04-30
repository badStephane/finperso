'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import * as categoryService from '@/lib/services/categoryService'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Category, CategoryType } from '@/types'

const ICONS = [
  '🛒', '🚌', '🏠', '💊', '📱', '🎮', '📚', '📦',
  '💰', '💻', '🎯', '🏦', '✈️', '🍽️', '👕', '🎵',
]
const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD', '#888780']

export default function CategoriesPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('DEPENSE')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#1D9E75')
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const result = await categoryService.getCategories(user.uid)
      setCategories(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setSubmitting(true)
    try {
      await categoryService.addCategory(user.uid, { name: name.trim(), icon, color, type })
      toast('Catégorie ajoutée', 'success')
      setShowForm(false)
      setName('')
      await load()
    } catch {
      toast('Échec de l’ajout', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!user || !toDelete) return
    setDeleting(true)
    try {
      await categoryService.deleteCategory(user.uid, toDelete.id)
      toast('Catégorie supprimée', 'success')
      setToDelete(null)
      await load()
    } catch {
      toast('Échec de la suppression', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function handleDeleteClick(cat: Category) {
    if (cat.isDefault) {
      toast('Impossible de supprimer une catégorie par défaut', 'error')
      return
    }
    setToDelete(cat)
  }

  const depenses = categories.filter((c) => c.type === 'DEPENSE')
  const revenus = categories.filter((c) => c.type === 'REVENU')

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Catégories"
        back
        action={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            aria-label="Ajouter une catégorie"
            className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-[#E1F5EE] transition-colors"
          >
            <Plus size={22} className="text-[#1D9E75]" />
          </button>
        }
      />

      {loading ? (
        <div className="p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="flex-1 overflow-y-auto pb-4">
          {[
            { title: 'Dépenses', items: depenses },
            { title: 'Revenus', items: revenus },
          ].map(({ title, items }) => (
            <div key={title}>
              <p className="px-4 pt-5 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {title}
              </p>
              <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden stagger-children">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune catégorie</p>
                ) : (
                  items.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-3 py-3 border-b border-gray-100 last:border-b-0 min-h-[56px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-base shrink-0"
                          style={{ backgroundColor: cat.color + '1A' }}
                          aria-hidden="true"
                        >
                          {cat.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {cat.name}
                        </span>
                      </div>
                      {!cat.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="w-11 h-11 flex items-center justify-center text-gray-400 active:text-[#D85A30] active:bg-[#FAECE7] rounded-lg transition-colors shrink-0"
                          aria-label={`Supprimer ${cat.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="Nouvelle catégorie">
        <form onSubmit={handleAdd} className="space-y-4 pb-2">
          <div>
            <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom de la catégorie
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Restaurants"
              required
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1" role="radiogroup" aria-label="Type">
            {(['DEPENSE', 'REVENU'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={`flex-1 min-h-[44px] text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  type === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {t === 'DEPENSE' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Icône</p>
            <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="Choisir une icône">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={icon === i}
                  aria-label={`Icône ${i}`}
                  onClick={() => setIcon(i)}
                  className={`aspect-square min-h-[44px] rounded-lg flex items-center justify-center text-lg border-2 transition-colors active:scale-95 ${
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
            {submitting ? 'Ajout...' : 'Ajouter la catégorie'}
          </button>
        </form>
      </BottomSheet>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cette catégorie ?"
        description={
          toDelete
            ? `"${toDelete.name}" sera supprimée. Les transactions existantes garderont son nom.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
