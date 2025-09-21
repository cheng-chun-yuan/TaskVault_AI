import { Button } from "@workspace/ui/components/button"
import { LoadingSpinner } from "./LoadingSpinner"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@workspace/ui/components/button"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2" 
        />
      )}
      {loading ? (loadingText || children) : children}
    </Button>
  )
}