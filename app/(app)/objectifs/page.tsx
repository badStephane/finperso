'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useObjectifs } from '@/hooks/useObjectifs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { GoalCard } from '@/components/objectifs/GoalCard'
import { GoalForm } from '@/components/objectifs/GoalForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { Target, Plus } from 'lucide-react'

export default function ObjectifsPage() {
  const router = useRouter()
  const { objectifs, loading, loadObjectifs } = useObjectifs()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadObjectifs()
  }, [loadObjectifs])

  const activeCount = objectifs.filter((o) => !o.isCompleted).length

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Objectifs"
        action={
          <Badge variant="positive">{activeCount} actifs</Badge>
        }
      />

      {loading ? (
        <div className="p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : objectifs.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Aucun objectif"
          description="Définissez un objectif d'épargne"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-xl text-sm font-medium"
            >
              Créer un objectif
            </button>
          }
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {objectifs.map((obj) => (
            <GoalCard
              key={obj.id}
              objectif={obj}
              onClick={() => router.push(`/objectifs/${obj.id}`)}
            />
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500"
          >
            <Plus size={16} />
            Nouvel objectif
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-medium">Nouvel objectif</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500"
              >
                Fermer
              </button>
            </div>
            <GoalForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
