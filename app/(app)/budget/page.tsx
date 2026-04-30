'use client'

import { useEffect, useState } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { BudgetSummary } from '@/components/budget/BudgetSummary'
import { CategoryBudgetItem } from '@/components/budget/CategoryBudgetItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { PieChart, Plus } from 'lucide-react'
import { format, setMonth, setYear } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function BudgetPage() {
  const {
    budgets,
    month,
    year,
    loading,
    setMonth: setM,
    setYear: setY,
    loadBudgets,
    setBudget,
  } = useBudget()
  const { categories } = useCategories('DEPENSE')
  const [showAdd, setShowAdd] = useState(false)
  const [newCatId, setNewCatId] = useState('')
  const [newAmount, setNewAmount] = useState('')

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets, month, year])

  const monthLabel = format(
    setYear(setMonth(new Date(), month - 1), year),
    'MMMM yyyy',
    { locale: fr }
  )

  function handleNav(dir: -1 | 1) {
    let m = month + dir
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setM(m)
    setY(y)
  }

  async function handleAddBudget() {
    const cat = categories.find((c) => c.id === newCatId)
    if (!cat || !newAmount) return
    await setBudget({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      amount: parseInt(newAmount),
    })
    setShowAdd(false)
    setNewCatId('')
    setNewAmount('')
  }

  const unbudgeted = categories.filter(
    (c) => !budgets.some((b) => b.categoryId === c.id)
  )

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={`Budget`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => handleNav(-1)} className="text-gray-400 px-1">‹</button>
            <Badge variant="positive">{monthLabel}</Badge>
            <button onClick={() => handleNav(1)} className="text-gray-400 px-1">›</button>
          </div>
        }
      />

      {loading ? (
        <div className="p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : budgets.length === 0 && !showAdd ? (
        <EmptyState
          icon={PieChart}
          title="Aucun budget"
          description="Définissez un budget par catégorie"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-xl text-sm font-medium"
            >
              Ajouter un budget
            </button>
          }
        />
      ) : (
        <>
          <BudgetSummary budgets={budgets} />
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Par catégorie</h2>
          </div>
          <div className="px-4 pb-4 flex-1 overflow-y-auto">
            {budgets.map((b) => (
              <CategoryBudgetItem
                key={b.id}
                budget={b}
                onUpdate={(amount) =>
                  setBudget({
                    categoryId: b.categoryId,
                    categoryName: b.categoryName,
                    categoryIcon: b.categoryIcon,
                    amount,
                  })
                }
              />
            ))}
            {!showAdd && unbudgeted.length > 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500"
              >
                <Plus size={16} />
                Ajouter une catégorie
              </button>
            )}
          </div>
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Ajouter un budget</h2>
              <button onClick={() => setShowAdd(false)} className="text-sm text-gray-500">
                Fermer
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
              <select
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              >
                <option value="">Choisir...</option>
                {unbudgeted.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Montant (F CFA)</label>
              <input
                type="text"
                inputMode="numeric"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="100 000"
                className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
            </div>
            <button
              onClick={handleAddBudget}
              disabled={!newCatId || !newAmount}
              className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-medium disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
