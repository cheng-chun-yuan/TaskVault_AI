"use client"

import { useState } from "react"
import SelfQRcodeWrapper from "@selfxyz/qrcode"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { X } from "lucide-react"

interface SelfQRModalProps {
  isOpen: boolean
  onClose: () => void
  selfApp: any
  onSuccess?: () => void
  title?: string
  description?: string
}

export function SelfQRModal({
  isOpen,
  onClose,
  selfApp,
  onSuccess,
  title = "Verify Your Identity",
  description = "Scan the QR code with your Self app to verify your identity and gain access to this task."
}: SelfQRModalProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSuccess = async () => {
    setIsVerifying(true)
    try {
      await onSuccess?.()
    } finally {
      setIsVerifying(false)
      onClose()
    }
  }

  if (!selfApp) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex justify-center">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccess}
            />
          </div>
          
          {isVerifying && (
            <div className="text-sm text-muted-foreground">
              Processing verification...
            </div>
          )}
          
          <div className="text-xs text-center text-muted-foreground max-w-sm">
            Don't have the Self app? Download it from the{" "}
            <a 
              href="https://apps.apple.com/app/self-app/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              App Store
            </a>{" "}
            or{" "}
            <a 
              href="https://play.google.com/store/apps/details?id=com.self.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Play
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}