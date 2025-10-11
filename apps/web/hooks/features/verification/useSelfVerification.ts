"use client"

import { useState, useEffect } from "react"
import { SelfAppBuilder } from "@selfxyz/qrcode"
import type { SelfApp } from "@selfxyz/qrcode"
import { hivemindAppLogo } from "@/content/hivemindAppLogo"
import { useAccount } from "wagmi"

interface SelfDisclosures {
  minimumAge?: number
  excludedCountries?: string[]
  ofac?: boolean
  nationality?: boolean
  name?: boolean
  gender?: boolean
  date_of_birth?: boolean
  passport_number?: boolean
  expiry_date?: boolean
  issuing_date?: boolean
}

interface SelfVerificationConfig {
  endpoint?: string
  endpointType?: "staging_celo" | "celo" | "https"
  taskId?: string
}

export function useSelfVerification(
  appName: string = "HiveMind AI",
  scope: string = "hivemind-ai",
  disclosures: SelfDisclosures = {},
  config: SelfVerificationConfig = {}
) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const { address } = useAccount()

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined' || !address) return

    try {
      const appConfig: any = {
        version: 2,
        appName,
        scope,
        logoBase64: hivemindAppLogo,
        userId: address,
        userIdType: "hex",
        disclosures: {
          minimumAge: disclosures.minimumAge || 18,
          excludedCountries: disclosures.excludedCountries || [],
          ofac: disclosures.ofac !== false,
          nationality: disclosures.nationality !== false,
          name: disclosures.name !== false,
          gender: disclosures.gender !== false,
          date_of_birth: disclosures.date_of_birth !== false,
          passport_number: disclosures.passport_number !== false,
          expiry_date: disclosures.expiry_date !== false,
          issuing_date: disclosures.issuing_date !== false,
        },
      }

      // Add endpoint configuration if provided
      if (config.endpoint) {
        appConfig.endpoint = config.endpoint
        appConfig.endpointType = config.endpointType || "https"
      }

      const app = new SelfAppBuilder(appConfig).build()
      setSelfApp(app)
    } catch (error) {
      console.error('Failed to initialize SelfApp:', error)
      setSelfApp(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, appName, scope, JSON.stringify(disclosures), JSON.stringify(config)])

  return {
    selfApp,
    isReady: !!selfApp && !!address,
  }
}