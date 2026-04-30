'use client'

export type ThemePreference = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'finperso:theme'

export function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'auto'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw
  return 'auto'
}

export function setStoredPreference(value: ThemePreference) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, value)
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * Inline script run before paint — written into the document head — to apply
 * the saved (or system) theme without waiting for React. Prevents the white
 * flash on cold start when the user prefers dark.
 *
 * Stringified and embedded via a <script dangerouslySetInnerHTML>. Keep it
 * self-contained: no imports, no helpers from this file at runtime.
 */
export const NO_FLASH_INLINE_SCRIPT = `(function() {
  try {
    var raw = window.localStorage.getItem('${STORAGE_KEY}');
    var pref = raw === 'light' || raw === 'dark' || raw === 'auto' ? raw : 'auto';
    var dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();`
