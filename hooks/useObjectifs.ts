'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useObjectifStore } from '@/stores/objectifStore'
import { useToastStore } from '@/stores/toastStore'
import * as objectifService from '@/lib/services/objectifService'

export function useObjectifs() {
  const user = useAuthStore((s) => s.user)
  const objectifs = useObjectifStore((s) => s.objectifs)
  const loading = useObjectifStore((s) => s.loading)
  const setObjectifs = useObjectifStore((s) => s.setObjectifs)
  const setLoading = useObjectifStore((s) => s.setLoading)
  const toast = useToastStore((s) => s.show)

  const loadObjectifs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await objectifService.getObjectifs(user.uid)
      setObjectifs(result)
    } catch {
      toast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, setLoading, setObjectifs, toast])

  const create = useCallback(
    async (data: {
      name: string
      targetAmount: number
      deadline: Date | null
      icon: string
      color: string
    }) => {
      if (!user) return
      try {
        await objectifService.createObjectif(user.uid, data)
        toast('Objectif créé')
        await loadObjectifs()
      } catch {
        toast('Erreur lors de la création', 'error')
      }
    },
    [user, toast, loadObjectifs]
  )

  const addContribution = useCallback(
    async (objectifId: string, data: { amount: number; note: string | null }) => {
      if (!user) return
      try {
        await objectifService.addContribution(user.uid, objectifId, data)
        toast('Contribution ajoutée')
        await loadObjectifs()
      } catch {
        toast("Erreur lors de l'ajout", 'error')
      }
    },
    [user, toast, loadObjectifs]
  )

  const remove = useCallback(
    async (objectifId: string) => {
      if (!user) return
      try {
        await objectifService.deleteObjectif(user.uid, objectifId)
        toast('Objectif supprimé')
        await loadObjectifs()
      } catch {
        toast('Erreur lors de la suppression', 'error')
      }
    },
    [user, toast, loadObjectifs]
  )

  return {
    objectifs,
    loading,
    loadObjectifs,
    create,
    addContribution,
    remove,
  }
}
