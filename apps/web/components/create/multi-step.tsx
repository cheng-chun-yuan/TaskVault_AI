"use client"

import { useRouter } from "next/navigation"
import { useWriteContract, useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { TaskFormProvider, useTaskForm } from "@/context/task-form"
import { toast } from "@workspace/ui/hooks/use-toast" 
import { TaskVaultCore } from "@/content/address"
import { TaskVaultCoreAbi, ERC20MockAbi } from "@/content/abi"
import { formatEther, parseEther } from "viem"
import ProgressIndicator from "./progress-indicator"
import TaskDetailsStep from "./details"
import VerificationStep from "./verification"
import JudgesStep from "./judges"
import PrizeStep from "./prize"
import { hashEndpointWithScope, getPackedForbiddenCountries, countries } from "@selfxyz/core"

function TaskFormContent() {
  const router = useRouter()
  const { currentStep, setCurrentStep, validateStep, formData } = useTaskForm()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  // Wait for the transaction receipt once hash is available
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Trigger save to DB once transaction is confirmed
  useEffect(() => {
    const saveTaskToDB = async () => {
      if (!isConfirmed || !address || !formData.deadline) return

      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            criteria: formData.criteria,
            deadline: formData.deadline,
            tokenAddress: formData.tokenAddress as `0x${string}`,
            amount: formData.amount,
            styleCommit: formData.styleCommit,
            creatorAddress: address,
          }),
        })

        if (!response.ok) throw new Error("Failed to save task")

        const { task } = await response.json()
        router.push(`/task/${task.taskId}`)
      } catch (error) {
        console.error("Error saving task:", error)
        toast({
          title: "Error",
          description: "Failed to save task. Please try again.",
          variant: "destructive",
        })
      }
    }

    saveTaskToDB()
  }, [isConfirmed, address, formData, router])

  const checkAndApproveToken = async () => {
    if (!address || !formData.tokenAddress || !formData.amount) return false

    try {
      if (!publicClient) return false

      // Check current allowance
      const allowance = await publicClient.readContract({
        address: formData.tokenAddress as `0x${string}`,
        abi: ERC20MockAbi,
        functionName: 'allowance',
        args: [address, TaskVaultCore],
      }) as bigint

      console.log("Current allowance:", formatEther(allowance))
      // If allowance is insufficient, request approval
      if (!allowance || Number(formatEther(allowance)) < Number(formData.amount)) {
        const approveTx = await writeContractAsync({
          address: formData.tokenAddress as `0x${string}`,
          abi: ERC20MockAbi,
          functionName: 'approve',
          args: [TaskVaultCore, parseEther(formData.amount)],
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
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    if (!address || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please connect wallet and set deadline",
        variant: "destructive",
      })
      return
    }

    try {
      // First approve tokens if needed
      const isApproved = await checkAndApproveToken()
      const scopeName = 'trustjudge-ai';
      const endpoint = `https://novel-rapidly-panda.ngrok-free.app/api/verify/0`;
      const scope = hashEndpointWithScope(endpoint, scopeName);
      const attestationId = 1n;
      const olderThanEnabled = formData.minimumAge ? true : false;
      const olderThan = formData.minimumAge ? BigInt(formData.minimumAge) : 0n;
      let forbiddenCountriesEnabled = false;
      let forbiddenCountriesListPackedString: string[] = [];
      if (formData.excludedCountries.length > 0) {
        forbiddenCountriesEnabled = true;
        forbiddenCountriesListPackedString = getPackedForbiddenCountries(formData.excludedCountries);
      }
      const ofacEnabled = [formData.ofac, false, false];
      if (!isApproved) return

      const txHash = await writeContractAsync({
        address: TaskVaultCore,
        abi: TaskVaultCoreAbi,
        functionName: "createTask",
        args: [
          formData.criteria,
          formData.styleCommit,
          BigInt(Math.floor(formData.deadline.getTime() / 1000)),
          formData.tokenAddress as `0x${string}`,
          parseEther(formData.amount),
          BigInt(scope),
          attestationId,
          olderThanEnabled,
          olderThan,
          forbiddenCountriesEnabled,
          forbiddenCountriesListPackedString.map(n => BigInt(n)) as [bigint, bigint, bigint, bigint],
          ofacEnabled
        ],
      })

      setTxHash(txHash)
    } catch (err) {
      console.error("Error creating task:", err)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Task</CardTitle>
          <CardDescription>Fill in the details to create your task</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          
          {currentStep === 1 && <TaskDetailsStep />}
          {currentStep === 2 && <VerificationStep />}
          {currentStep === 3 && <JudgesStep />}
          {currentStep === 4 && <PrizeStep />}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Create Task
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function MultiStepForm() {
  return (
    <TaskFormProvider>
      <TaskFormContent />
    </TaskFormProvider>
  )
}
