'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/firebase/config'
import { Skeleton } from '@/components/ui/SkeletonLoader'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Subscribe so the rest of the app can read user/profile from the store.
  useAuth()
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)

  // Wait for Firebase to confirm the initial auth state before deciding.
  // The store's `loading` flag can't be used here: it stays true while the
  // profile snapshot is in flight, which would block rendering forever if
  // Firestore is slow or offline. Auth and profile are now independent.
  useEffect(() => {
    let cancelled = false
    auth.authStateReady().then(() => {
      if (!cancelled) setAuthReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (!auth.currentUser) {
      router.replace('/login')
    }
  }, [authReady, router])

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-3 w-48">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!auth.currentUser) return null

  return <>{children}</>
}
