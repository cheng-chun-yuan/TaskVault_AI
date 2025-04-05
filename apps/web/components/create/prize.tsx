"use client"

import { AlertCircle } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { cn } from "@/lib/utils"
import { useTaskForm } from "@/context/task-form"

export default function PrizeStep() {
  const { formData, errors, updateFormData } = useTaskForm()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prizeType">Prize Type</Label>
        <RadioGroup
          id="prizeType"
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="token" id="token" />
            <Label htmlFor="token" className="cursor-pointer">
              Token
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nft" id="nft" disabled />
            <Label htmlFor="nft" className="cursor-pointer text-muted-foreground">
              NFT (Coming soon...)
            </Label>
          </div>
        </RadioGroup>
      </div>
        <>
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              value={formData.tokenAddress}
              onChange={(e) => updateFormData("tokenAddress", e.target.value)}
              placeholder="0x..."
              className={cn("font-mono", errors.tokenAddress ? "border-destructive" : "")}
            />
            {errors.tokenAddress && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" /> {errors.tokenAddress}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => updateFormData("amount", e.target.value)}
              placeholder="0.0"
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" /> {errors.amount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPerTime">Max Reward Per Time</Label>
            <Input
              id="maxPerTime"
              type="number"
              value={formData.maxPerTime}
              onChange={(e) => updateFormData("maxPerTime", e.target.value)}
              placeholder="0.0"
              className={errors.maxPerTime ? "border-destructive" : ""}
            />
            {errors.maxPerTime && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" /> {errors.maxPerTime}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPerDay">Max Reward Per Day</Label>
            <Input
              id="maxPerDay"
              type="number"
              value={formData.maxPerDay}
              onChange={(e) => updateFormData("maxPerDay", e.target.value)}
              placeholder="0.0"
              className={errors.maxPerDay ? "border-destructive" : ""}
            />
            {errors.maxPerDay && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" /> {errors.maxPerDay}
              </p>
            )}
          </div>
        </>
    </div>
  )
}
