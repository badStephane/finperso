'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/firebase/config'
import { AppSplash } from '@/components/AppSplash'

const SPLASH_MIN_MS = 600

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Subscribe so the rest of the app can read user/profile from the store.
  useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    setMounted(true)
    let cancelled = false
    if (auth) {
      auth.authStateReady().then(() => {
        if (cancelled) return
        setHasUser(!!auth.currentUser)
        setAuthReady(true)
      })
    }
    const t = setTimeout(() => setMinTimePassed(true), SPLASH_MIN_MS)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    setHasUser(!!auth?.currentUser)
    if (!auth?.currentUser) {
      router.replace('/login')
    }
  }, [authReady, router])

  // Fade out once both gates pass, then unmount the splash after the transition.
  const ready = authReady && minTimePassed
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setSplashGone(true), 320)
    return () => clearTimeout(t)
  }, [ready])

  // SSR / pre-render: show splash, no children, no Firebase access.
  if (!mounted) return <AppSplash />

  if (!hasUser && authReady) return null

  return (
    <>
      {!splashGone && <AppSplash fadingOut={ready} />}
      {hasUser && children}
    </>
  )
}
