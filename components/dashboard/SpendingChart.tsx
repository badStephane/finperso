'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { formatCFA } from '@/lib/utils/currency'
import type { Budget } from '@/types'

interface SpendingChartProps {
  budgets: Budget[]
}

const COLORS = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#639922', '#7F77DD', '#888780']

export function SpendingChart({ budgets }: SpendingChartProps) {
  const data = budgets
    .filter((b) => b.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6)
    .map((b) => ({
      name: b.categoryIcon + ' ' + b.categoryName,
      spent: b.spent,
    }))

  if (data.length === 0) return null

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Dépenses par catégorie</h2>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
        <ResponsiveContainer width="100%" height={Math.max(140, data.length * 32)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-700 dark:text-gray-300 fill-current"
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums shrink-0">
                {formatCFA(d.spent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
