'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, List, Target, PieChart, User, Plus } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Accueil', icon: LayoutGrid },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/transactions/new', label: 'Ajouter', icon: Plus, isFab: true },
  { href: '/objectifs', label: 'Objectifs', icon: Target },
  { href: '/budget', label: 'Budget', icon: PieChart },
  { href: '/profil', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label="Ajouter une transaction"
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-[#1D9E75] text-white shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-[#0F6E56] shrink-0"
              >
                <Plus size={26} strokeWidth={2.5} />
              </Link>
            )
          }

          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[44px] min-h-[44px] cursor-pointer transition-colors ${
                isActive ? 'text-[#1D9E75] dark:text-[#2BB68B]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'scale-110 transition-transform' : ''} />
              <span className={`text-[11px] leading-none ${isActive ? 'font-semibold' : 'font-medium'} truncate max-w-full`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
