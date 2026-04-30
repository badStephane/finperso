'use client'

type HapticPattern = 'tap' | 'success' | 'error' | 'warning'

const patterns: Record<HapticPattern, number | number[]> = {
  tap: 8,
  success: [10, 40, 10],
  warning: [20, 60, 20],
  error: [50, 40, 50],
}

/**
 * Fires a short vibration pattern on supported devices (Android Chrome, etc.).
 * No-op on iOS Safari (Apple still doesn't expose Vibration API on the web).
 * Honors prefers-reduced-motion. Safe to call from anywhere.
 */
export function haptic(pattern: HapticPattern = 'tap'): void {
  if (typeof window === 'undefined') return
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  } catch {
    // ignore
  }
  try {
    navigator.vibrate(patterns[pattern])
  } catch {
    // ignore
  }
}
