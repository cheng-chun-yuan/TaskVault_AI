"use client"

import { useState, useEffect } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { SubmissionRegistry } from "@/content/address"
import { SubmissionRegistryAbi } from "@/content/abi"

export function useRegistrationStatus(taskId: string) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  useEffect(() => {
    const checkRegistration = async () => {
      if (!address || !publicClient || !isConnected || !taskId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const registered = await publicClient.readContract({
          address: SubmissionRegistry,
          abi: SubmissionRegistryAbi,
          functionName: 'verifiedUsers',
          args: [taskId, address],
        }) as boolean
        
        setIsRegistered(registered)
      } catch (error) {
        console.error('Error checking registration:', error)
        setIsRegistered(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkRegistration()
  }, [address, publicClient, taskId, isConnected])

  return {
    isRegistered,
    isLoading,
  }
}