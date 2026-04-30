'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  ariaLabel?: string
}

export function Card({ children, className = '', onClick, ariaLabel }: CardProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`block w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 active:bg-gray-50 dark:active:bg-gray-800 active:scale-[0.99] transition-all ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}
