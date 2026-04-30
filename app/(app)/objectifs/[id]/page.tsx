'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useObjectifs } from '@/hooks/useObjectifs'
import { getObjectif, getContributions } from '@/lib/services/objectifService'
import { GoalCard } from '@/components/objectifs/GoalCard'
import { ContributionForm } from '@/components/objectifs/ContributionForm'
import { formatCFA } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import type { Objectif, Contribution } from '@/types'

export default function ObjectifDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const user = useAuthStore((s) => s.user)
  const { remove } = useObjectifs()

  const [objectif, setObjectif] = useState<Objectif | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) return
    const [obj, contribs] = await Promise.all([
      getObjectif(user.uid, id),
      getContributions(user.uid, id),
    ])
    setObjectif(obj)
    setContributions(contribs)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user, id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    if (!confirm('Supprimer cet objectif ?')) return
    await remove(id)
    router.back()
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!objectif) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Objectif introuvable
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-medium text-gray-900">{objectif.name}</h1>
        </div>
        <button onClick={handleDelete} className="w-10 h-10 flex items-center justify-center">
          <Trash2 size={18} className="text-[#D85A30]" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <GoalCard objectif={objectif} />

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Ajouter une contribution</h3>
          <ContributionForm objectifId={id} onDone={load} />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Historique ({contributions.length})
          </h3>
          {contributions.length === 0 ? (
            <p className="text-xs text-gray-400">Aucune contribution</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="text-sm text-[#0F6E56] font-medium">
                      +{formatCFA(c.amount)}
                    </p>
                    {c.note && (
                      <p className="text-[10px] text-gray-500">{c.note}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {c.date ? formatDate(c.date.toDate()) : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
