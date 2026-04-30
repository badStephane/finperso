'use client'

import { useMemo } from 'react'
import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrendingDown, TrendingUp, Wallet, Target } from 'lucide-react'
import { formatCFA } from '@/lib/utils/currency'
import type { MonthlyStats } from '@/types'

interface MonthlyInsightsProps {
  stats?: Record<string, MonthlyStats>
}

type Tone = 'good' | 'warn' | 'info'

interface Insight {
  tone: Tone
  text: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const TONE_STYLES: Record<Tone, { bg: string; fg: string; iconBg: string }> = {
  good: {
    bg: 'bg-[#E1F5EE] dark:bg-[#0F2B23]',
    fg: 'text-[#085041] dark:text-[#9FE3C4]',
    iconBg: 'bg-[#1D9E75]',
  },
  warn: {
    bg: 'bg-[#FAECE7] dark:bg-[#2A130B]',
    fg: 'text-[#993C1D] dark:text-[#F0997B]',
    iconBg: 'bg-[#D85A30]',
  },
  info: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    fg: 'text-gray-700 dark:text-gray-300',
    iconBg: 'bg-gray-500',
  },
}

function buildInsights(stats: Record<string, MonthlyStats>): Insight[] {
  const out: Insight[] = []
  const now = new Date()
  const thisKey = format(now, 'yyyy-MM')
  const prev = subMonths(now, 1)
  const prevKey = format(prev, 'yyyy-MM')
  const thisMonth = stats[thisKey]
  const prevMonth = stats[prevKey]

  if (!thisMonth || (thisMonth.totalDepenses === 0 && thisMonth.totalRevenus === 0)) {
    return out
  }

  // 1) Spending trend vs previous month (only when both months have spending)
  if (prevMonth?.totalDepenses && thisMonth.totalDepenses) {
    const diff = thisMonth.totalDepenses - prevMonth.totalDepenses
    const pct = Math.round((diff / prevMonth.totalDepenses) * 100)
    if (Math.abs(pct) >= 5) {
      const monthLabel = format(prev, 'MMMM', { locale: fr })
      out.push({
        tone: pct > 0 ? 'warn' : 'good',
        Icon: pct > 0 ? TrendingUp : TrendingDown,
        text:
          pct > 0
            ? `Tu dépenses ${pct}% de plus qu'en ${monthLabel}.`
            : `Tu dépenses ${Math.abs(pct)}% de moins qu'en ${monthLabel}. Bravo.`,
      })
    }
  }

  // 2) Saving rate or deficit this month
  const net = thisMonth.totalRevenus - thisMonth.totalDepenses
  if (thisMonth.totalRevenus > 0) {
    const ratio = net / thisMonth.totalRevenus
    if (ratio >= 0.1) {
      out.push({
        tone: 'good',
        Icon: Target,
        text: `Tu mets de côté ${Math.round(ratio * 100)}% de tes revenus ce mois.`,
      })
    } else if (net < 0) {
      out.push({
        tone: 'warn',
        Icon: Wallet,
        text: `Déficit de ${formatCFA(Math.abs(net))} ce mois — dépenses au-dessus des revenus.`,
      })
    }
  } else if (net < 0) {
    out.push({
      tone: 'warn',
      Icon: Wallet,
      text: `Aucun revenu enregistré ce mois — ${formatCFA(Math.abs(net))} de dépenses.`,
    })
  }

  // 3) Net solde fallback when nothing else qualified
  if (out.length === 0 && net !== 0) {
    out.push({
      tone: net > 0 ? 'good' : 'warn',
      Icon: Wallet,
      text: `Solde du mois : ${net > 0 ? '+' : '−'}${formatCFA(Math.abs(net))}.`,
    })
  }

  return out.slice(0, 2)
}

export function MonthlyInsights({ stats }: MonthlyInsightsProps) {
  const insights = useMemo(() => (stats ? buildInsights(stats) : []), [stats])

  if (insights.length === 0) return null

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Tendance</h2>
      <div className="space-y-2">
        {insights.map((ins, i) => {
          const style = TONE_STYLES[ins.tone]
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl ${style.bg}`}
              role="status"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${style.iconBg}`}
                aria-hidden="true"
              >
                <ins.Icon size={16} />
              </span>
              <p className={`text-sm leading-snug ${style.fg}`}>{ins.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
