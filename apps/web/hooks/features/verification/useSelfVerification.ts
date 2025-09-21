"use client"

import { useState, useEffect } from "react"
import { SelfApp, SelfAppBuilder } from "@selfxyz/qrcode"
import { useAccount } from "wagmi"

interface SelfDisclosures {
  minimumAge?: number
  excludedCountries?: string[]
  ofac?: boolean
  nationality?: boolean
  name?: boolean
}

export function useSelfVerification(
  appName: string = "TaskVault AI",
  scope: string = "taskvault-ai",
  disclosures: SelfDisclosures = {}
) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const { address } = useAccount()

  useEffect(() => {
    if (!address) return

    const app = new SelfAppBuilder({
      appName,
      scope,
      disclosures: {
        minimumAge: disclosures.minimumAge && disclosures.minimumAge > 0 ? disclosures.minimumAge : undefined,
        excludedCountries: disclosures.excludedCountries || [],
        ofac: disclosures.ofac || false,
        nationality: disclosures.nationality !== false,
        name: disclosures.name !== false,
      },
    }).build()

    setSelfApp(app)
  }, [address, appName, scope, JSON.stringify(disclosures)])

  return {
    selfApp,
    isReady: !!selfApp && !!address,
  }
}