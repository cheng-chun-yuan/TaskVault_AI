"use client"

import React, { useState } from "react"
import { countryCodes } from "@selfxyz/core"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { AlertCircle } from "lucide-react"

interface CountrySelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedCountries: string[]
  onSelectionChange: (countries: string[]) => void
  maxSelection?: number
  title?: string
}

export function CountrySelector({
  isOpen,
  onClose,
  selectedCountries,
  onSelectionChange,
  maxSelection = 40,
  title = "Select Countries to Exclude",
}: CountrySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCountries)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCountryToggle = (code: string) => {
    setTempSelection((prev) => {
      if (prev.includes(code)) {
        setError(null)
        return prev.filter((c) => c !== code)
      }
      if (prev.length >= maxSelection) {
        setError(`Maximum ${maxSelection} countries can be selected`)
        return prev
      }
      return [...prev, code]
    })
  }

  const handleSave = () => {
    onSelectionChange(tempSelection)
    onClose()
  }

  const handleCancel = () => {
    setTempSelection(selectedCountries)
    setError(null)
    onClose()
  }

  const filteredCountries = Object.entries(countryCodes).filter(([, name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 inline-block mr-1" />
            {error}
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
                  checked={tempSelection.includes(code)}
                  onChange={() => handleCountryToggle(code)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>

        <div className="text-sm text-muted-foreground">
          {tempSelection.length} of {maxSelection} countries selected
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}