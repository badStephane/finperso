'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import * as service from '@/lib/services/recurrenceService'
import type { CreateRecurrenceInput, Recurrence } from '@/types'

export function useRecurrences() {
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [recurrences, setRecurrences] = useState<Recurrence[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const list = await service.getRecurrences(user.uid)
      setRecurrences(list)
    } catch {
      toast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    load()
  }, [load])

  const due = useMemo(() => {
    const now = Date.now()
    return recurrences.filter(
      (r) => r.active && r.nextDueDate.toDate().getTime() <= now
    )
  }, [recurrences])

  const add = useCallback(
    async (data: CreateRecurrenceInput) => {
      if (!user) return
      try {
        await service.addRecurrence(user.uid, data)
        await load()
        toast('Récurrence créée', 'success')
      } catch {
        toast("Erreur lors de l'ajout", 'error')
        throw new Error('add failed')
      }
    },
    [user, load, toast]
  )

  const remove = useCallback(
    async (id: string) => {
      if (!user) return
      try {
        await service.deleteRecurrence(user.uid, id)
        setRecurrences((rs) => rs.filter((r) => r.id !== id))
        toast('Récurrence supprimée')
      } catch {
        toast('Erreur lors de la suppression', 'error')
      }
    },
    [user, toast]
  )

  const toggle = useCallback(
    async (rec: Recurrence) => {
      if (!user) return
      try {
        await service.updateRecurrence(user.uid, rec.id, { active: !rec.active })
        setRecurrences((rs) =>
          rs.map((r) => (r.id === rec.id ? { ...r, active: !rec.active } : r))
        )
      } catch {
        toast('Erreur de mise à jour', 'error')
      }
    },
    [user, toast]
  )

  const confirm = useCallback(
    async (rec: Recurrence) => {
      if (!user) return
      try {
        await service.confirmRecurrence(user.uid, rec)
        await load()
        toast('Transaction enregistrée', 'success')
      } catch {
        toast('Erreur de validation', 'error')
        throw new Error('confirm failed')
      }
    },
    [user, load, toast]
  )

  const skip = useCallback(
    async (rec: Recurrence) => {
      if (!user) return
      try {
        await service.skipRecurrence(user.uid, rec)
        await load()
        toast('Échéance reportée')
      } catch {
        toast('Erreur', 'error')
      }
    },
    [user, load, toast]
  )

  return {
    recurrences,
    due,
    loading,
    reload: load,
    add,
    remove,
    toggle,
    confirm,
    skip,
  }
}
