'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import type { Category, CategoryType } from '@/types'

export function useCategories(type?: CategoryType) {
  const user = useAuthStore((s) => s.user)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getDocs(collection(db, `users/${user.uid}/categories`))
      .then((snap) => {
        let cats = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)
        if (type) cats = cats.filter((c) => c.type === type)
        setCategories(cats)
      })
      .finally(() => setLoading(false))
  }, [user, type])

  return { categories, loading }
}
