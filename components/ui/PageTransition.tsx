'use client'

import { usePathname } from 'next/navigation'

/**
 * Re-mounts children with a `key` on pathname so the CSS pageEnter animation
 * fires on every route change. Subtle fade + 6px slide-up — feels like a
 * native page push. Pages keep their data through Zustand stores, so
 * remounting just costs the initial render, not the data.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="page-transition flex flex-col flex-1 min-h-0">
      {children}
    </div>
  )
}
