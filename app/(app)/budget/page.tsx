'use client'

import { useEffect, useState } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { PageHeader } from '@/components/ui/PageHeader'
import { BudgetSummary } from '@/components/budget/BudgetSummary'
import { CategoryBudgetItem } from '@/components/budget/CategoryBudgetItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useToastStore } from '@/stores/toastStore'
import { PieChart, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, setMonth, setYear } from 'date-fns'
import { fr } from 'date-fns/locale'

function formatThousands(digits: string): string {
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

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
  const showToast = useToastStore((s) => s.show)
  const [showAdd, setShowAdd] = useState(false)
  const [newCatId, setNewCatId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets, month, year])

  const monthLabel = format(setYear(setMonth(new Date(), month - 1), year), 'MMMM yyyy', {
    locale: fr,
  })

  function handleNav(dir: -1 | 1) {
    let m = month + dir
    let y = year
    if (m < 1) {
      m = 12
      y--
    }
    if (m > 12) {
      m = 1
      y++
    }
    setM(m)
    setY(y)
  }

  async function handleAddBudget() {
    const cat = categories.find((c) => c.id === newCatId)
    if (!cat || !newAmount) return
    setSubmitting(true)
    try {
      await setBudget({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        amount: parseInt(newAmount),
      })
      showToast('Budget ajouté', 'success')
      setShowAdd(false)
      setNewCatId('')
      setNewAmount('')
    } catch {
      showToast('Échec de l’ajout', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const unbudgeted = categories.filter((c) => !budgets.some((b) => b.categoryId === c.id))

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Budget" />

      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-2 py-2">
        <button
          type="button"
          onClick={() => handleNav(-1)}
          aria-label="Mois précédent"
          className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-700 active:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <p className="text-sm font-semibold text-gray-900 capitalize tabular-nums">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => handleNav(1)}
          aria-label="Mois suivant"
          className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-700 active:bg-gray-100 transition-colors"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Aucun budget"
          description="Définissez un budget par catégorie pour suivre vos dépenses."
          action={
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="h-11 px-5 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Ajouter un budget
            </button>
          }
        />
      ) : (
        <>
          <BudgetSummary budgets={budgets} />
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Par catégorie</h2>
          </div>
          <div className="px-4 pb-4 flex-1 overflow-y-auto space-y-2 stagger-children">
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
            {unbudgeted.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 active:bg-gray-50 transition-colors"
              >
                <Plus size={18} />
                Ajouter une catégorie
              </button>
            )}
          </div>
        </>
      )}

      <BottomSheet open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un budget">
        <div className="space-y-4 pb-2">
          <div>
            <label htmlFor="budget-cat" className="block text-sm font-medium text-gray-700 mb-1.5">
              Catégorie
            </label>
            <select
              id="budget-cat"
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
            <label
              htmlFor="budget-amount"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Montant (F CFA)
            </label>
            <input
              id="budget-amount"
              type="text"
              inputMode="numeric"
              value={formatThousands(newAmount)}
              onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="100 000"
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] tabular-nums"
            />
          </div>
          <button
            type="button"
            onClick={handleAddBudget}
            disabled={!newCatId || !newAmount || submitting}
            aria-busy={submitting}
            className="w-full h-12 bg-[#1D9E75] text-white rounded-xl font-semibold text-base disabled:opacity-50 active:bg-[#0F6E56] active:scale-[0.99] transition-all"
          >
            {submitting ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
