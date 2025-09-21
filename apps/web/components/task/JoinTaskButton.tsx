"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@workspace/ui/components/button"
import { useNotification } from "@/context"
import { Check, Clock, Tag } from "lucide-react"

interface JoinTaskButtonProps {
  taskId: string
  taskTitle: string
  submissionTag?: string
  telegramChatId?: string
  rewardTiming: 'INSTANT' | 'POST_EVENT'
  criteria: string[]
  isActive: boolean
  deadline: Date
}

export function JoinTaskButton({ 
  taskId, 
  taskTitle, 
  submissionTag,
  telegramChatId,
  rewardTiming,
  criteria,
  isActive,
  deadline
}: JoinTaskButtonProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const { address } = useAccount()
  const { success, error } = useNotification()

  const handleJoin = async () => {
    if (!address) {
      error("Error", "Please connect your wallet first")
      return
    }

    if (!isActive || deadline < new Date()) {
      error("Error", "This task is no longer active")
      return
    }

    setIsJoining(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join task')
      }

      setHasJoined(true)
      success("Success", data.instructions.message)
    } catch (err: any) {
      error("Error", err.message)
    } finally {
      setIsJoining(false)
    }
  }

  if (!isActive || deadline < new Date()) {
    return (
      <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Task has ended</span>
        </div>
      </div>
    )
  }

  if (hasJoined) {
    return (
      <div className="space-y-4 p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="h-5 w-5" />
          <span className="font-medium">Successfully joined task!</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">How to Submit:</h4>
            {submissionTag ? (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-900 rounded border">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{submissionTag}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Submission instructions will be provided by the task creator.
              </p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Criteria:</h4>
            <ul className="space-y-1">
              {criteria.map((criterion, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {criterion}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {rewardTiming === 'INSTANT' ? 'Instant rewards after AI approval' : 'Rewards after task deadline'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleJoin} 
        disabled={isJoining || !address}
        className="w-full"
        size="lg"
      >
        {isJoining ? "Joining..." : "Join Task"}
      </Button>
      
      {!address && (
        <p className="text-sm text-muted-foreground text-center">
          Connect your wallet to join this task
        </p>
      )}

      <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm">Task Requirements:</h4>
        <ul className="space-y-1">
          {criteria.map((criterion, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {criterion}
            </li>
          ))}
        </ul>
        
        {submissionTag && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Submit by posting in Telegram with tag:
            </p>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm">{submissionTag}</span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          <Clock className="h-3 w-3 inline mr-1" />
          {rewardTiming === 'INSTANT' ? 'Instant rewards after AI approval' : 'Rewards distributed after task deadline'}
        </div>
      </div>
    </div>
  )
}