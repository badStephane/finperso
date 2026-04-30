'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-32" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
