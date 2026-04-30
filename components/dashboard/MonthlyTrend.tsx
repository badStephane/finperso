'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatCFA } from '@/lib/utils/currency'
import type { MonthlyStats } from '@/types'

interface MonthlyTrendProps {
  stats?: Record<string, MonthlyStats>
}

const COLOR_REVENU = '#1D9E75'
const COLOR_DEPENSE = '#D85A30'

interface ChartDatum {
  month: string
  fullLabel: string
  revenus: number
  depenses: number
}

interface TooltipPayloadEntry {
  payload?: ChartDatum
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const datum = payload[0].payload
  if (!datum) return null
  const net = datum.revenus - datum.depenses
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize mb-1">{datum.fullLabel}</p>
      <p className="text-[#0F6E56] dark:text-[#2BB68B] tabular-nums">+{formatCFA(datum.revenus)}</p>
      <p className="text-[#993C1D] dark:text-[#F0997B] tabular-nums">−{formatCFA(datum.depenses)}</p>
      <p className="text-gray-700 dark:text-gray-300 tabular-nums mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
        Net&nbsp;: {net >= 0 ? '+' : '−'}
        {formatCFA(Math.abs(net))}
      </p>
    </div>
  )
}

export function MonthlyTrend({ stats }: MonthlyTrendProps) {
  const data = useMemo<ChartDatum[]>(() => {
    const out: ChartDatum[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const key = format(date, 'yyyy-MM')
      const m = stats?.[key]
      out.push({
        month: format(date, 'MMM', { locale: fr }).replace('.', ''),
        fullLabel: format(date, 'MMMM yyyy', { locale: fr }),
        revenus: m?.totalRevenus ?? 0,
        depenses: m?.totalDepenses ?? 0,
      })
    }
    return out
  }, [stats])

  const hasData = data.some((d) => d.revenus > 0 || d.depenses > 0)
  if (!hasData) return null

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Évolution 6 mois</h2>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400 fill-current"
              interval={0}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="revenus" fill={COLOR_REVENU} radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="depenses" fill={COLOR_DEPENSE} radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: COLOR_REVENU }}
              aria-hidden="true"
            />
            <span className="text-gray-600 dark:text-gray-400">Revenus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: COLOR_DEPENSE }}
              aria-hidden="true"
            />
            <span className="text-gray-600 dark:text-gray-400">Dépenses</span>
          </div>
        </div>
      </div>
    </div>
  )
}
