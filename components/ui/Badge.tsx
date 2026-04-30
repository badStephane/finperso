'use client'

type BadgeVariant = 'positive' | 'negative' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  positive: 'bg-[#E1F5EE] text-[#085041]',
  negative: 'bg-[#FAECE7] text-[#993C1D]',
  neutral: 'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
