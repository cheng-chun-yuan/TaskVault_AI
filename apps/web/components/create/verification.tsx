"use client"

import React, { useState, useEffect } from "react"
import SelfQRcodeWrapper, { countries, SelfApp, SelfAppBuilder } from "@selfxyz/qrcode"
import { countryCodes } from "@selfxyz/core"
import { useAccount } from "wagmi"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useTaskForm } from "@/context/task-form-context"

export default function VerificationStep() {
  const { address } = useAccount()
  const { formData, updateFormData } = useTaskForm()

  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(formData.excludedCountries)
  const [countrySelectionError, setCountrySelectionError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!address) return
    const app = new SelfAppBuilder({
      appName: "TaskVault_AI",
      scope: "taskvault-ai",
      endpoint: "https://playground.self.xyz/api/verify",
      endpointType: "https",
      logoBase64: "https://i.imgur.com/Rz8B3s7.png",
      userId: address,
      userIdType: "hex",
      disclosures: {
        minimumAge: formData.minimumAge > 0 ? formData.minimumAge : undefined,
        excludedCountries: formData.excludedCountries,
        ofac: formData.ofac,
      },
      devMode: false,
    }).build()
    setSelfApp(app)
  }, [formData.minimumAge, formData.excludedCountries, formData.ofac, address])

  const handleAgeChange = (value: number) => {
    updateFormData("minimumAge", value)
  }

  const handleCheckboxChange = (value: boolean) => {
    updateFormData("ofac", value)
  }

  const handleCountryToggle = (code: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(code)) {
        setCountrySelectionError(null)
        return prev.filter((c) => c !== code)
      }
      if (prev.length >= 40) {
        setCountrySelectionError("Maximum 40 countries can be excluded")
        return prev
      }
      return [...prev, code]
    })
  }

  const saveCountrySelection = () => {
    updateFormData("excludedCountries", selectedCountries)
    setShowCountryModal(false)
  }

  const filteredCountries = Object.entries(countryCodes).filter(([_, name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          {selfApp && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => console.log("Verification successful")}
                darkMode={false}
              />
              <p className="text-sm text-muted-foreground">User ID: {address?.substring(0, 8)}...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country Modal */}
      <Dialog open={showCountryModal} onOpenChange={setShowCountryModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Countries to Exclude</DialogTitle>
          </DialogHeader>

          {countrySelectionError && (
            <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 inline-block mr-1" />
              {countrySelectionError}
            </div>
          )}

          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <ScrollArea className="h-[300px] border rounded-md px-2 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredCountries.map(([code, name]) => (
                <label
                  key={code}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(code)}
                    onChange={() => handleCountryToggle(code)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCountryModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveCountrySelection}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
