import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface ErrorMessageProps {
  error: string | null
  onDismiss?: () => void
  variant?: 'default' | 'destructive'
  className?: string
}

export function ErrorMessage({
  error,
  onDismiss,
  variant = 'destructive',
  className
}: ErrorMessageProps) {
  if (!error) return null

  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
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
        </div>
      </AlertDescription>
    </Alert>
  )
}