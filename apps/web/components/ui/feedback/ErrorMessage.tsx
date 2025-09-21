import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { BaseComponentProps } from "@/types"

interface ErrorMessageProps extends BaseComponentProps {
  error: string | null
  onDismiss?: () => void
  variant?: 'default' | 'destructive'
}

export function ErrorMessage({
  error,
  onDismiss,
  variant = 'destructive',
  className,
  children
}: ErrorMessageProps) {
  if (!error) return null

  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-1 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
      {children}
    </Alert>
  )
}