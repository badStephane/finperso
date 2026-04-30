'use client'

import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#0F6E56]" strokeWidth={1.8} />
      </div>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
