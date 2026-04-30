'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import type { Compte } from '@/types'

export function useComptes() {
  const user = useAuthStore((s) => s.user)
  const [comptes, setComptes] = useState<Compte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getDocs(collection(db, `users/${user.uid}/comptes`))
      .then((snap) => {
        setComptes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Compte))
      })
      .finally(() => setLoading(false))
  }, [user])

  return { comptes, loading }
}
