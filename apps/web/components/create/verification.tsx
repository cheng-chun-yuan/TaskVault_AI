"use client"

import React, { useState } from "react"
import { SelfQRcodeWrapper } from "@selfxyz/qrcode"
import { useAccount } from "wagmi"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useTaskForm } from "@/context/task-form"
import { useSelfVerification } from "@/hooks"
import { CountrySelector } from "@/components/ui/global"

export default function VerificationStep() {
  const { address } = useAccount()
  const { formData, updateFormData } = useTaskForm()
  const [showCountryModal, setShowCountryModal] = useState(false)

  const { selfApp, isReady } = useSelfVerification(
    "TaskVault AI",
    "taskvault-ai",
    {
      minimumAge: formData.minimumAge,
      excludedCountries: formData.excludedCountries,
      ofac: formData.ofac,
      nationality: true,
      name: true,
    }
  )

  const handleAgeChange = (value: number) => {
    updateFormData("minimumAge", value)
  }

  const handleCheckboxChange = (value: boolean) => {
    updateFormData("ofac", value)
  }

  const handleCountrySelectionChange = (countries: string[]) => {
    updateFormData("excludedCountries", countries)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold">Verification Options</h2>

          {/* Age Slider */}
          <div className="space-y-2">
            <Label>Minimum Age</Label>
            <div className="flex justify-between text-sm">
              <span>Required Age</span>
              <span>{formData.minimumAge}</span>
            </div>
            <Slider
              value={[formData.minimumAge]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => handleAgeChange(val[0] ?? 0)}
            />
            <p className="text-sm text-muted-foreground">Set to 0 to disable age requirement</p>
          </div>

          {/* OFAC Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ofac-check"
              checked={formData.ofac}
              onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
            />
            <Label htmlFor="ofac-check">Enable OFAC Check</Label>
          </div>

          {/* Excluded Country Setting */}
          <div className="space-y-2">
            <Label>Excluded Countries</Label>
            <Button variant="outline" onClick={() => setShowCountryModal(true)}>
              Configure Excluded Countries
            </Button>
            <p className="text-sm text-muted-foreground">
              {formData.excludedCountries.length} countries excluded
            </p>
          </div>

          {/* QR Code */}
          {isReady && selfApp && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => console.log("Verification successful")}
                onError={(error) => console.error("Verification error:", error)}
                darkMode={false}
              />
              <p className="text-sm text-muted-foreground">User ID: {address?.substring(0, 8)}...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CountrySelector
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountries={formData.excludedCountries}
        onSelectionChange={handleCountrySelectionChange}
        title="Select Countries to Exclude"
      />
    </div>
  )
}
