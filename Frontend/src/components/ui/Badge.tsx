import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'muted' | 'danger'
}

const tones = {
  default: 'border-primary-100 bg-primary-50 text-primary-700',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  muted: 'border-border bg-surface text-muted',
  danger: 'border-red-100 bg-red-50 text-red-700',
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-medium', tones[tone])}>{children}</span>
}
