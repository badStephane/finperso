'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredPreference,
  resolveTheme,
  setStoredPreference,
  type ThemePreference,
} from '@/lib/utils/theme'

export function useTheme() {
  const [pref, setPref] = useState<ThemePreference>('auto')

  // Read the stored preference once mounted; SSR sees the initial 'auto'.
  useEffect(() => {
    setPref(getStoredPreference())
  }, [])

  // Re-evaluate on system change while in 'auto' mode.
  useEffect(() => {
    if (pref !== 'auto' || typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(resolveTheme('auto'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const setPreference = useCallback((next: ThemePreference) => {
    setPref(next)
    setStoredPreference(next)
    applyTheme(resolveTheme(next))
  }, [])

  return { preference: pref, setPreference }
}
