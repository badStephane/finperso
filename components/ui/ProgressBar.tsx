'use client'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  className?: string
}

export function ProgressBar({
  value,
  max,
  color = '#1D9E75',
  className = '',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  let barColor = color
  if (pct >= 100) barColor = '#D85A30'
  else if (pct >= 80) barColor = '#BA7517'

  return (
    <div className={`h-[5px] bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  )
}
