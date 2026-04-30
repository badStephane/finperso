'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { useComptes } from '@/hooks/useComptes'
import { useToastStore } from '@/stores/toastStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InstallPrompt } from '@/components/InstallPrompt'
import { formatCFA } from '@/lib/utils/currency'
import { exportTransactionsCSV, downloadCSV } from '@/lib/services/exportService'
import { CreditCard, Tag, Download, LogOut, ChevronRight, Loader2, Repeat } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  COURANT: 'Courant',
  EPARGNE: 'Épargne',
  MOBILE_MONEY: 'Mobile Money',
  ESPECES: 'Espèces',
}

export default function ProfilPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { comptes } = useComptes()

  const initials =
    profile?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? ''

  const toast = useToastStore((s) => s.show)
  const [exporting, setExporting] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

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
      toast('Export téléchargé', 'success')
    } catch {
      toast("Erreur lors de l'export", 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Profil" />

      <div className="bg-white border-b border-gray-200 flex flex-col items-center py-6">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center text-lg font-semibold text-[#085041]">
          {initials || '?'}
        </div>
        <p className="text-base font-semibold text-gray-900 mt-3">{profile?.name}</p>
        <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[80%]">{user?.email}</p>
      </div>

      <div className="mx-4 mt-3">
        <InstallPrompt />
      </div>

      <div className="mx-4 mt-3 grid grid-cols-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="text-center py-3 px-1 border-r border-gray-200">
          <p className="text-base font-semibold text-gray-900 tabular-nums">{comptes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">comptes</p>
        </div>
        <div className="text-center py-3 px-1 border-r border-gray-200 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate tabular-nums">
            {formatCFA(comptes.reduce((s, c) => s + c.balance, 0))}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">solde total</p>
        </div>
        <div className="text-center py-3 px-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {profile?.createdAt
              ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('fr')
              : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">membre depuis</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Mes comptes</h2>
        <Link
          href="/profil/comptes"
          className="text-sm text-[#1D9E75] font-medium px-2 -mr-2 py-1.5 rounded-md active:bg-[#E1F5EE]"
        >
          Gérer
        </Link>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {comptes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucun compte</p>
        ) : (
          comptes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-3 py-3 border-b border-gray-100 last:border-b-0 min-h-[56px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TYPE_LABELS[c.type] ?? c.type}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                {formatCFA(c.balance)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-4 pt-5 pb-2">
        <h2 className="text-base font-semibold text-gray-900">Paramètres</h2>
      </div>
      <div className="mx-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Link
          href="/profil/comptes"
          className="flex items-center justify-between px-3 py-3 border-b border-gray-100 active:bg-gray-50 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E1F5EE' }}
            >
              <CreditCard size={18} className="text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-900">Mes comptes</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link
          href="/profil/categories"
          className="flex items-center justify-between px-3 py-3 border-b border-gray-100 active:bg-gray-50 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FAEEDA' }}
            >
              <Tag size={18} className="text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-900">Catégories</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link
          href="/profil/recurrences"
          className="flex items-center justify-between px-3 py-3 border-b border-gray-100 active:bg-gray-50 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E1F5EE' }}
            >
              <Repeat size={18} className="text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-900">Récurrences</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          aria-busy={exporting}
          className="w-full flex items-center justify-between px-3 py-3 active:bg-gray-50 min-h-[56px] disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#EAF3DE' }}
            >
              {exporting ? (
                <Loader2 size={18} className="text-gray-700 animate-spin" />
              ) : (
                <Download size={18} className="text-gray-700" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {exporting ? 'Export en cours...' : 'Exporter données'}
            </span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="mx-4 mt-5 mb-6">
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-3 px-4 min-h-[56px] py-3 bg-[#FAECE7] border border-[#F0997B] rounded-xl cursor-pointer active:bg-[#f5ddd4] transition-colors"
        >
          <LogOut size={18} className="text-[#993C1D]" />
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-[#712B13]">Déconnexion</p>
            <p className="text-xs text-[#993C1D] truncate">{profile?.name}</p>
          </div>
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Vous devrez vous reconnecter pour accéder à vos données."
        confirmLabel="Se déconnecter"
        destructive
        onConfirm={handleSignOut}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}
