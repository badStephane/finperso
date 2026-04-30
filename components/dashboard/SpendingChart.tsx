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
    <div className="mx-4 mt-2">
      <h2 className="text-sm font-medium text-gray-900 mb-3">Dépenses par catégorie</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] text-gray-500">
              {d.name}: {formatCFA(d.spent)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
