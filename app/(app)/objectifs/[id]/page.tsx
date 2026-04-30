'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useObjectifs } from '@/hooks/useObjectifs'
import { getObjectif, getContributions } from '@/lib/services/objectifService'
import { GoalCard } from '@/components/objectifs/GoalCard'
import { ContributionForm } from '@/components/objectifs/ContributionForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
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
  const [error, setError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const [obj, contribs] = await Promise.all([
        getObjectif(user.uid, id),
        getContributions(user.uid, id),
      ])
      setObjectif(obj)
      setContributions(contribs)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await remove(id)
      router.back()
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={objectif?.name ?? 'Objectif'}
        back
        action={
          objectif && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label="Supprimer l'objectif"
              className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-[#FAECE7] transition-colors"
            >
              <Trash2 size={20} className="text-[#D85A30]" />
            </button>
          )
        }
      />

      {loading ? (
        <div className="p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : !objectif ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          Objectif introuvable
        </div>
      ) : (
        <div className="p-4 space-y-5">
          <GoalCard objectif={objectif} />

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Ajouter une contribution
            </h3>
            <ContributionForm objectifId={id} onDone={load} />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2 px-1">
              Historique ({contributions.length})
            </h3>
            {contributions.length === 0 ? (
              <p className="text-sm text-gray-400 px-1">Aucune contribution pour l’instant.</p>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 min-h-[52px]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#0F6E56] font-semibold tabular-nums">
                        +{formatCFA(c.amount)}
                      </p>
                      {c.note && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{c.note}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 shrink-0 ml-2">
                      {c.date ? formatDate(c.date.toDate()) : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer cet objectif ?"
        description="L’historique des contributions sera également supprimé. Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
