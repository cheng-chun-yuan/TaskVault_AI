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
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined' || !address) return

    try {
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
    } catch (error) {
      console.error('Failed to initialize SelfApp:', error)
      setSelfApp(null)
    }
  }, [address, appName, scope, JSON.stringify(disclosures)])

  return {
    selfApp,
    isReady: !!selfApp && !!address,
  }
}