'use client'

import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { onAuthChange } from '@/lib/firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import type { UserProfile } from '@/types'

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    const unsubAuth = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      const unsubProfile = onSnapshot(
        doc(db, `users/${firebaseUser.uid}`),
        (snap) => {
          if (snap.exists()) {
            setProfile({ ...snap.data() } as UserProfile)
          }
          setLoading(false)
        }
      )

      return () => unsubProfile()
    })

    return () => unsubAuth()
  }, [setUser, setProfile, setLoading])

  return { user, profile, loading }
}
