'use client'

import dynamic from 'next/dynamic'
import { AuthGuard } from '@/components/AuthGuard'
import { Toast } from '@/components/ui/Toast'

const BottomNav = dynamic(
  () => import('@/components/ui/BottomNav').then((m) => m.BottomNav),
  { ssr: false }
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen pb-16">
        {children}
      </div>
      <BottomNav />
      <Toast />
    </AuthGuard>
  )
}
