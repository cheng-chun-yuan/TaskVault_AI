import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-base'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      config.container,
      className
    )}>
      {Icon && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-muted rounded-full animate-pulse" />
            <div className="relative bg-background rounded-full p-4 border-2 border-muted">
              <Icon className={cn(config.icon, 'text-muted-foreground')} />
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto space-y-2">
        <h3 className={cn('font-semibold', config.title)}>
          {title}
        </h3>
        
        {description && (
          <p className={cn('text-muted-foreground', config.description)}>
            {description}
          </p>
        )}
        
        {action && (
          <div className="pt-4">
            {action.href ? (
              <Button asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}