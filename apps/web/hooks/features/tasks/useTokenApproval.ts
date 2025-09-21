"use client"

import { useState } from "react"
import { useWriteContract, usePublicClient } from "wagmi"
import { formatEther, parseEther } from "viem"
import { toast } from "@workspace/ui/hooks/use-toast"
import { TaskVaultCore } from "@/content/address"
import { ERC20MockAbi } from "@/content/abi"

export function useTokenApproval() {
  const [isApproving, setIsApproving] = useState(false)
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const checkAndApproveToken = async (
    address: `0x${string}` | undefined,
    tokenAddress: string,
    amount: string
  ): Promise<boolean> => {
    if (!address || !tokenAddress || !amount) return false

    try {
      setIsApproving(true)
      
      if (!publicClient) return false

      // Check current allowance
      const allowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20MockAbi,
        functionName: 'allowance',
        args: [address, TaskVaultCore],
      }) as bigint

      console.log("Current allowance:", formatEther(allowance))
      
      // If allowance is insufficient, request approval
      if (!allowance || Number(formatEther(allowance)) < Number(amount)) {
        const approveTx = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: ERC20MockAbi,
          functionName: 'approve',
          args: [TaskVaultCore, parseEther(amount)],
        })

        // Wait for approval transaction
        const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTx })
        if (!approveReceipt.status) {
          throw new Error('Token approval failed')
        }
      }

      return true
    } catch (error) {
      console.error('Error approving token:', error)
      toast({
        title: "Error",
        description: "Failed to approve token. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsApproving(false)
    }
  }

  return {
    checkAndApproveToken,
    isApproving,
  }
}