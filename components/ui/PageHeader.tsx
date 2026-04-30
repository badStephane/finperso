'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  action?: React.ReactNode
  back?: boolean | string
}

export function PageHeader({ title, action, back }: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof back === 'string') router.push(back)
    else router.back()
  }

  return (
    <div
      className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center gap-2 px-2 sm:px-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between w-full h-14">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {back && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Retour"
              className="-ml-1 w-11 h-11 flex items-center justify-center rounded-lg text-gray-700 active:bg-gray-100 transition-colors shrink-0"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.2} />
            </button>
          )}
          <h1 className={`text-base font-medium text-gray-900 truncate ${back ? '' : 'pl-2'}`}>
            {title}
          </h1>
        </div>
        {action && <div className="shrink-0 -mr-1">{action}</div>}
      </div>
    </div>
  )
}
