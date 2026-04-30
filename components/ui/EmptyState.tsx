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
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
