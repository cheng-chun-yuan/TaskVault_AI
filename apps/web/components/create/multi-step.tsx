"use client"

import { useRouter } from "next/navigation"
import { useWriteContract, useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { useState, useEffect } from "react"
import { useTokenApproval } from "@/hooks"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { TaskFormProvider, useTaskForm } from "@/context/task-form"
import { useNotification, useUser } from "@/context" 
import { ERC20Mock } from "@/content/address"
import { TaskVaultCoreAbi } from "@/content/abi"
import { parseEther } from "viem"
import ProgressIndicator from "./progress-indicator"
import TaskDetailsStep from "./details"
import VerificationStep from "./verification"
import JudgesStep from "./judges"
import PrizeStep from "./prize"
import { hashEndpointWithScope, getPackedForbiddenCountries } from "@/lib/self-utils"

function TaskFormContent() {
  const router = useRouter()
  const { currentStep, setCurrentStep, validateStep, formData, updateFormData } = useTaskForm()
  const { error, success, taskCreated } = useNotification()
  const { addActivity } = useUser()

  // Initialize token address
  useEffect(() => {
    if (!formData.tokenAddress) {
      updateFormData("tokenAddress", ERC20Mock)
    }
  }, [])
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
      // if (!isConfirmed || !address || !formData.deadline) return
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
            taskType: formData.taskType,
            telegramChatId: formData.telegramChatId,
            submissionTag: formData.submissionTag,
            rewardTiming: formData.rewardTiming,
          }),
        })

        if (!response.ok) throw new Error("Failed to save task")

        const { task } = await response.json()
        
        // Add activity and show success notification
        addActivity({
          type: "task_created",
          title: `Created task: ${formData.title}`,
          description: `Task created with ${formData.amount} ETH prize`,
          taskId: task.taskId,
        })
        
        taskCreated(task.taskId, formData.title)
        router.push(`/task/${task.taskId}`)
      } catch (error) {
        console.error("Error saving task:", error)
        error("Error", "Failed to save task. Please try again.")
      }
    }

    saveTaskToDB()
  }, [address, formData, router])

  const { checkAndApproveToken } = useTokenApproval()

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
      error("Error", "Please connect wallet and set deadline")
      return
    }

    try {
      // First approve tokens if needed
      const isApproved = await checkAndApproveToken(address, formData.tokenAddress, formData.amount)
      const scopeName = 'trustjudge-ai';
      const taskCounter = await publicClient?.readContract({
        address: TaskVaultCore,
        abi: TaskVaultCoreAbi,
        functionName: 'taskCounter',
        args: [],
      }) as bigint
      const endpoint = `https://novel-rapidly-panda.ngrok-free.app/api/verify/${Number(taskCounter)}`;
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
      const forbiddenCountriesPacked: [bigint, bigint, bigint, bigint] = 
        Array.isArray(forbiddenCountriesListPackedString) && forbiddenCountriesListPackedString.length === 4
          ? forbiddenCountriesListPackedString.map(n => BigInt(n)) as [bigint, bigint, bigint, bigint]
          : [0n, 0n, 0n, 0n];

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
          forbiddenCountriesPacked,
          ofacEnabled,
          parseEther(formData.maxPerTime),
          parseEther(formData.maxPerDay),
        ],
      })

      setTxHash(txHash)
      success("Transaction Submitted", "Task creation transaction has been submitted to the blockchain")
    } catch (err) {
      console.error("Error creating task:", err)
      error("Error", "Failed to create task. Please try again.")
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
