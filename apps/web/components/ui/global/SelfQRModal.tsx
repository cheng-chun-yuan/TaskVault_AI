"use client"

import React from "react"
import SelfQRcodeWrapper, { SelfApp } from "@selfxyz/qrcode"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"

interface SelfQRModalProps {
  isOpen: boolean
  onClose: () => void
  selfApp: SelfApp | null
  onSuccess?: () => void
  title?: string
  description?: string
  darkMode?: boolean
}

export function SelfQRModal({
  isOpen,
  onClose,
  selfApp,
  onSuccess,
  title = "Verification Required",
  description = "Scan to verify and register",
  darkMode = true,
}: SelfQRModalProps) {
  if (!selfApp) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <div className="flex justify-center">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={onSuccess || (() => console.log("Verification successful"))}
              darkMode={darkMode}
            />
          </div>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}