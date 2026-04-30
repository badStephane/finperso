'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { formatCFA } from '@/lib/utils/currency'
import { useCountUp } from '@/hooks/useCountUp'
import type { Compte, MonthlyStats } from '@/types'

interface BalanceCardProps {
  comptes: Compte[]
  monthStats?: MonthlyStats
}

export function BalanceCard({ comptes, monthStats }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false)
  const totalBalance = comptes.reduce((sum, c) => sum + c.balance, 0)

  const animatedTotal = useCountUp(totalBalance, 700)
  const animatedDepenses = useCountUp(monthStats?.totalDepenses ?? 0, 700)
  const animatedRevenus = useCountUp(monthStats?.totalRevenus ?? 0, 700)

  const display = (amount: number) => (hidden ? '••• F' : formatCFA(Math.round(amount)))

  return (
    <div className="mx-3 mt-3 bg-[#0F6E56] rounded-2xl p-4" role="region" aria-label="Solde total">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/80 font-medium">Solde total</p>
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          aria-label={hidden ? 'Afficher le solde' : 'Masquer le solde'}
          aria-pressed={hidden}
          className="-mr-1 -mt-1 w-9 h-9 flex items-center justify-center rounded-full text-white/80 active:bg-white/10 transition-colors"
        >
          {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
      <p
        aria-live="polite"
        className="text-[26px] sm:text-3xl font-semibold text-white mt-1 mb-3 tracking-tight tabular-nums break-all"
      >
        {display(animatedTotal)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.12] rounded-lg px-3 py-2.5">
          <p className="text-xs text-white/80 leading-tight">Dépenses ce mois</p>
          <p className="text-sm font-semibold text-white mt-1 tabular-nums">
            {display(animatedDepenses)}
          </p>
        </div>
        <div className="bg-white/[0.12] rounded-lg px-3 py-2.5">
          <p className="text-xs text-white/80 leading-tight">Revenus ce mois</p>
          <p className="text-sm font-semibold text-white mt-1 tabular-nums">
            {display(animatedRevenus)}
          </p>
        </div>
      </div>
    </div>
  )
}
