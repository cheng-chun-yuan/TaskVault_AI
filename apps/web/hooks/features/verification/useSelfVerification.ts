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
  date_of_birth?: boolean
}

interface SelfVerificationConfig {
  endpoint?: string
  endpointType?: "staging_celo" | "celo" | "https"
  taskId?: string
}

export function useSelfVerification(
  appName: string = "TaskVault AI",
  scope: string = "trustjudge-ai",
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
        appName,
        scope,
        userId: address,
        userIdType: "hex",
        version: 2, // Use v2 explicitly
        disclosures: {
          minimumAge: disclosures.minimumAge || 18,
          excludedCountries: disclosures.excludedCountries || [],
          ofac: disclosures.ofac !== false,
          nationality: disclosures.nationality !== false,
          name: disclosures.name !== false,
          date_of_birth: disclosures.date_of_birth !== false,
        },
        devMode: process.env.NODE_ENV === 'development',
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
  }, [address, appName, scope, JSON.stringify(disclosures), JSON.stringify(config)])

  return {
    selfApp,
    isReady: !!selfApp && !!address,
  }
}