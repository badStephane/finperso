'use client'

import { formatCFA } from '@/lib/utils/currency'
import type { Compte, MonthlyStats } from '@/types'

interface BalanceCardProps {
  comptes: Compte[]
  monthStats?: MonthlyStats
}

export function BalanceCard({ comptes, monthStats }: BalanceCardProps) {
  const totalBalance = comptes.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="mx-3 mt-3 bg-[#0F6E56] rounded-2xl p-4" role="region" aria-label="Solde total">
      <p className="text-[10px] text-[#9FE1CB]">Solde total</p>
      <p className="text-[22px] font-medium text-[#E1F5EE] mt-1 mb-3 tracking-tight">
        {formatCFA(totalBalance)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.12] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[#9FE1CB]">Dépenses ce mois</p>
          <p className="text-xs font-medium text-[#E1F5EE] mt-0.5">
            {formatCFA(monthStats?.totalDepenses ?? 0)}
          </p>
        </div>
        <div className="bg-white/[0.12] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[#9FE1CB]">Revenus ce mois</p>
          <p className="text-xs font-medium text-[#E1F5EE] mt-0.5">
            {formatCFA(monthStats?.totalRevenus ?? 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
