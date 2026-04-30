'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import * as categoryService from '@/lib/services/categoryService'
import type { Category, CategoryType } from '@/types'

const ICONS = ['🛒', '🚌', '🏠', '💊', '📱', '🎮', '📚', '📦', '💰', '💻', '🎯', '🏦', '✈️', '🍽️', '👕', '🎵']
const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD', '#888780']

export default function CategoriesPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('DEPENSE')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#1D9E75')

  async function load() {
    if (!user) return
    const result = await categoryService.getCategories(user.uid)
    setCategories(result)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    await categoryService.addCategory(user.uid, { name: name.trim(), icon, color, type })
    toast('Catégorie ajoutée')
    setShowForm(false)
    setName('')
    await load()
  }

  async function handleDelete(cat: Category) {
    if (!user) return
    if (cat.isDefault) {
      toast('Impossible de supprimer une catégorie par défaut', 'error')
      return
    }
    if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) return
    await categoryService.deleteCategory(user.uid, cat.id)
    toast('Catégorie supprimée')
    await load()
  }

  const depenses = categories.filter((c) => c.type === 'DEPENSE')
  const revenus = categories.filter((c) => c.type === 'REVENU')

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2 cursor-pointer">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-medium text-gray-900 flex-1">Catégories</h1>
        <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 flex items-center justify-center cursor-pointer">
          <Plus size={20} className="text-[#1D9E75]" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mx-4 mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la catégorie"
            required
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {(['DEPENSE', 'REVENU'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  type === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {t === 'DEPENSE' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Icône</p>
            <div className="flex gap-1.5 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border cursor-pointer ${
                    icon === i ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer ${color === c ? 'border-gray-900' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button type="submit" className="w-full h-10 bg-[#1D9E75] text-white rounded-xl text-sm font-medium cursor-pointer">
            Ajouter
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center py-6 text-sm text-gray-400">Chargement...</p>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4">
          {[{ title: 'Dépenses', items: depenses }, { title: 'Revenus', items: revenus }].map(({ title, items }) => (
            <div key={title}>
              <p className="px-4 pt-4 pb-2 text-xs font-medium text-gray-500">{title}</p>
              <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
                {items.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        {cat.icon}
                      </div>
                      <span className="text-sm text-gray-900">{cat.name}</span>
                    </div>
                    {!cat.isDefault && (
                      <button
                        onClick={() => handleDelete(cat)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#D85A30] cursor-pointer"
                        aria-label={`Supprimer ${cat.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
