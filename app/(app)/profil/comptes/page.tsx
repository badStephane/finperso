'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import * as compteService from '@/lib/services/compteService'
import { formatCFA } from '@/lib/utils/currency'
import type { Compte, CompteType } from '@/types'

const TYPES: { label: string; value: CompteType }[] = [
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
  { label: 'Banque', value: 'BANQUE' },
  { label: 'Espèces', value: 'ESPECES' },
  { label: 'Épargne', value: 'EPARGNE' },
]

const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD', '#888780']

export default function ComptesPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [comptes, setComptes] = useState<Compte[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<CompteType>('MOBILE_MONEY')
  const [color, setColor] = useState('#1D9E75')

  async function load() {
    if (!user) return
    const result = await compteService.getComptes(user.uid)
    setComptes(result)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    await compteService.addCompte(user.uid, { name: name.trim(), type, color })
    toast('Compte ajouté')
    setShowForm(false)
    setName('')
    await load()
  }

  async function handleDelete(compte: Compte) {
    if (!user) return
    if (compte.balance !== 0) {
      toast('Impossible de supprimer un compte avec un solde non nul', 'error')
      return
    }
    if (!confirm(`Supprimer le compte "${compte.name}" ?`)) return
    await compteService.deleteCompte(user.uid, compte.id)
    toast('Compte supprimé')
    await load()
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2 cursor-pointer">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-medium text-gray-900 flex-1">Mes comptes</h1>
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
            placeholder="Nom du compte"
            required
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CompteType)}
            className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] cursor-pointer"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
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

      <div className="mx-4 mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-center py-6 text-sm text-gray-400">Chargement...</p>
        ) : comptes.length === 0 ? (
          <p className="text-center py-6 text-sm text-gray-400">Aucun compte</p>
        ) : (
          comptes.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-3 py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: c.color }} />
                <div>
                  <p className="text-sm text-gray-900">{c.name}</p>
                  <p className="text-[10px] text-gray-500">{TYPES.find((t) => t.value === c.type)?.label ?? c.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{formatCFA(c.balance)}</span>
                {!c.isDefault && c.balance === 0 && (
                  <button
                    onClick={() => handleDelete(c)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#D85A30] cursor-pointer"
                    aria-label={`Supprimer ${c.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
