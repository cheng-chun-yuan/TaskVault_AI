"use client"

import { useState } from "react"
import { AlertCircle, CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TaskTypeSelector } from "@/components/create/task-type"
import { useTaskForm } from "@/context/task-form"

export default function TaskDetailsStep() {
  const { formData, errors, updateFormData, addCriterion, removeCriterion } = useTaskForm()
  const [criterionInput, setCriterionInput] = useState("")

  const handleAddCriterion = () => {
    if (criterionInput.trim()) {
      addCriterion(criterionInput)
      setCriterionInput("")
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="Enter task title"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <div className="flex items-center gap-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{errors.title}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Enter task description"
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <div className="flex items-center gap-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{errors.description}</p>
          </div>
        )}
      </div>

      <TaskTypeSelector />

      {formData.taskType === "TELEGRAM_GROUP" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
            <Input
              id="telegramChatId"
              value={formData.telegramChatId || ""}
              onChange={(e) => updateFormData("telegramChatId", e.target.value)}
              placeholder="Enter Telegram chat ID (e.g., -100123456789)"
              className={errors.telegramChatId ? "border-destructive" : ""}
            />
            <p className="text-sm text-muted-foreground">
              Telegram chat ID to track group activity. You can find it by adding @RawDataBot to your group.
            </p>
            {errors.telegramChatId && (
              <div className="flex items-center gap-x-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errors.telegramChatId}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="submissionTag">Submission Tag</Label>
            <Input
              id="submissionTag"
              value={formData.submissionTag || ""}
              onChange={(e) => updateFormData("submissionTag", e.target.value)}
              placeholder="Enter tag for submissions (e.g., #TaskVaultSubmit)"
              className={errors.submissionTag ? "border-destructive" : ""}
            />
            <p className="text-sm text-muted-foreground">
              Users must include this tag in their Telegram messages to submit. AI will automatically detect and judge submissions.
            </p>
            {errors.submissionTag && (
              <div className="flex items-center gap-x-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{errors.submissionTag}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="rewardTiming">Reward Timing</Label>
            <select
              id="rewardTiming"
              value={formData.rewardTiming || "INSTANT"}
              onChange={(e) => updateFormData("rewardTiming", e.target.value as "INSTANT" | "POST_EVENT")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="INSTANT">Instant Reward (immediately after AI approval)</option>
              <option value="POST_EVENT">Post-Event Reward (after task deadline)</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Choose when participants receive rewards after successful submission.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label>Criteria</Label>
        <div className="space-y-4">
          {formData.criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-x-2">
              <Input
                value={criterion}
                onChange={(e) => {
                  const newCriteria = [...formData.criteria]
                  newCriteria[index] = e.target.value
                  updateFormData("criteria", newCriteria)
                }}
                placeholder={`Criterion ${index + 1}`}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeCriterion(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-x-2">
            <Input
              value={criterionInput}
              onChange={(e) => setCriterionInput(e.target.value)}
              placeholder="Add a new criterion"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddCriterion()
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddCriterion}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.criteria && (
            <div className="flex items-center gap-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{errors.criteria}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Deadline</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.deadline && "text-muted-foreground",
                errors.deadline && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.deadline ? (
                format(formData.deadline, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.deadline}
              onSelect={(date) => updateFormData("deadline", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.deadline && (
          <div className="flex items-center gap-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{errors.deadline}</p>
          </div>
        )}
      </div>
    </div>
  )
}
