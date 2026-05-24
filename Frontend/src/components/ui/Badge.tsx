import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'muted'
}

const tones = {
  default: 'bg-primary-50 text-primary-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  muted: 'bg-surface text-muted',
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', tones[tone])}>{children}</span>
}
