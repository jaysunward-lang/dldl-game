import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

interface DlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'skill'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantMap = {
  primary: 'bg-accent-gold text-surface-base hover:bg-accent-gold-light',
  danger: 'bg-accent-crimson text-white hover:bg-accent-crimson-light',
  ghost: 'bg-transparent text-text-secondary border border-text-disabled/30 hover:bg-surface-field hover:text-text-primary',
  skill: 'bg-surface-field text-text-primary border border-accent-gold/30 hover:border-accent-gold/60 hover:shadow-hud-gold',
}

const sizeMap = {
  sm: 'px-2.5 py-1 text-hud-xs',
  md: 'px-4 py-2 text-hud-sm',
  lg: 'px-6 py-3 text-hud-base',
}

export default function DlButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: DlButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-hud font-bold transition-all duration-150',
        'active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  )
}