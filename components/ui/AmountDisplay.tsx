'use client'

import { formatCFA } from '@/lib/utils/currency'

interface AmountDisplayProps {
  amount: number
  showSign?: boolean
  className?: string
}

export function AmountDisplay({ amount, showSign = false, className = '' }: AmountDisplayProps) {
  const isPositive = amount >= 0
  const color = isPositive ? 'text-[#0F6E56]' : 'text-[#993C1D]'
  const sign = showSign ? (isPositive ? '+' : '-') : amount < 0 ? '-' : ''
  const displayAmount = Math.abs(amount)

  return (
    <span className={`font-medium ${color} ${className}`}>
      {sign}{formatCFA(displayAmount)}
    </span>
  )
}
