'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { useComptes } from '@/hooks/useComptes'
import { useToastStore } from '@/stores/toastStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCFA } from '@/lib/utils/currency'
import { exportTransactionsCSV, downloadCSV } from '@/lib/services/exportService'
import {
  CreditCard,
  Tag,
  Download,
  LogOut,
  ChevronRight,
  Loader2,
} from 'lucide-react'

export default function ProfilPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { comptes } = useComptes()

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? ''

  const toast = useToastStore((s) => s.show)
  const [exporting, setExporting] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  async function handleExport() {
    if (!user) return
    setExporting(true)
    try {
      const csv = await exportTransactionsCSV(user.uid)
      downloadCSV(csv, `finperso-export-${new Date().toISOString().split('T')[0]}.csv`)
      toast('Export téléchargé')
    } catch {
      toast('Erreur lors de l\'export', 'error')
    } finally {
      setExporting(false)
    }
  }

  const menuItems = [
    { icon: CreditCard, label: 'Mes comptes', color: '#E1F5EE', href: '/profil/comptes' },
    { icon: Tag, label: 'Catégories', color: '#FAEEDA', href: '/profil/categories' },
    { icon: exporting ? Loader2 : Download, label: exporting ? 'Export...' : 'Exporter données', color: '#EAF3DE', action: handleExport },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Profil" />

      {/* Profile header */}
      <div className="bg-white border-b border-gray-200 flex flex-col items-center py-5">
        <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center text-base font-medium text-[#085041]">
          {initials}
        </div>
        <p className="text-base font-medium text-gray-900 mt-2">{profile?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-3 grid grid-cols-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="text-center py-3 border-r border-gray-200">
          <p className="text-sm font-medium text-gray-900">{comptes.length}</p>
          <p className="text-[9px] text-gray-500">comptes</p>
        </div>
        <div className="text-center py-3 border-r border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {formatCFA(comptes.reduce((s, c) => s + c.balance, 0))}
          </p>
          <p className="text-[9px] text-gray-500">solde total</p>
        </div>
        <div className="text-center py-3">
          <p className="text-sm font-medium text-gray-900">
            {profile?.createdAt
              ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('fr')
              : '-'}
          </p>
          <p className="text-[9px] text-gray-500">membre depuis</p>
        </div>
      </div>

      {/* Comptes preview */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">Mes comptes</h2>
        <button onClick={() => router.push('/profil/comptes')} className="text-xs text-[#1D9E75] cursor-pointer">
          Gérer
        </button>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {comptes.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: c.color }} />
              <div>
                <p className="text-sm text-gray-900">{c.name}</p>
                <p className="text-[10px] text-gray-500">{c.type.replace('_', ' ')}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCFA(c.balance)}
            </span>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium text-gray-900">Paramètres</h2>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {menuItems.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              if ('href' in item && item.href) router.push(item.href)
              if ('action' in item && item.action) (item.action as () => void)()
            }}
            className="flex items-center justify-between px-3 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: item.color }}
              >
                <item.icon size={16} className="text-gray-700" />
              </div>
              <span className="text-sm text-gray-900">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-4 mb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#FAECE7] border border-[#F0997B] rounded-xl cursor-pointer active:bg-[#f5ddd4]"
        >
          <LogOut size={16} className="text-[#993C1D]" />
          <div className="text-left">
            <p className="text-sm font-medium text-[#712B13]">Déconnexion</p>
            <p className="text-[10px] text-[#993C1D]">{profile?.name}</p>
          </div>
        </button>
      </div>
    </div>
  )
}
