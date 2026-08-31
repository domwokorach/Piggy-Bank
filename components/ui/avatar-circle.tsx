import { cn, initials } from '@/lib/utils'

interface AvatarCircleProps {
  name: string
  imageUrl?: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<NonNullable<AvatarCircleProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-2xl',
}

export function AvatarCircle({ name, imageUrl, color, size = 'md', className }: AvatarCircleProps) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- avatar sources are user-uploaded data URIs
    return <img src={imageUrl} alt={name} className={cn('rounded-full object-cover', sizeClasses[size], className)} />
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color ?? 'var(--primary)' }}
    >
      {initials(name) || '?'}
    </div>
  )
}
