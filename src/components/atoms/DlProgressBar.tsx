import clsx from 'clsx'

interface DlProgressBarProps {
  value: number
  max: number
  color?: 'hp' | 'mp' | 'exp' | 'gold' | 'stamina'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  animated?: boolean
}

const colorMap = {
  hp: 'bg-battle-hp',
  mp: 'bg-battle-mp',
  exp: 'bg-battle-exp',
  gold: 'bg-accent-gold',
  stamina: 'bg-accent-emerald',
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export default function DlProgressBar({
  value,
  max,
  color = 'hp',
  size = 'md',
  showLabel = false,
  className,
  animated = true,
}: DlProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div
        className={clsx(
          'flex-1 rounded-hud-full overflow-hidden',
          color === 'hp' ? 'bg-battle-hp-bg' : color === 'mp' ? 'bg-battle-mp-bg' : 'bg-surface-field',
          sizeMap[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-hud-full',
            colorMap[color],
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-hud-xs font-mono text-text-secondary whitespace-nowrap">
          {value}/{max}
        </span>
      )}
    </div>
  )
}