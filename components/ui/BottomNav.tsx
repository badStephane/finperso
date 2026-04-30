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
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label="Ajouter une transaction"
                className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-[#1D9E75] text-white shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-[#0F6E56]"
              >
                <Plus size={24} strokeWidth={2.5} />
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
              className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors ${
                isActive ? 'text-[#1D9E75]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[9px] ${isActive ? 'font-medium' : ''}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
