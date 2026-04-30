'use client'

interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-base font-medium text-gray-900">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  )
}
