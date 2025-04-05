import { useTaskForm } from "@/context/task-form"
import { TaskType } from "@/types/task-form"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@workspace/ui/components/select"

const taskTypes: { value: TaskType; label: string; description: string; disabled?: boolean }[] = [
  {
    value: "TWITTER_INTERACT",
    label: "Twitter Interaction",
    description: "Tasks involving Twitter engagement like follows, retweets, or replies"
  },
  {
    value: "CONTENT_DELIVERY",
    label: "Content Delivery",
    description: "Tasks requiring content creation and delivery"
  },
  {
    value: "OMI_AI_DEVICE",
    label: "OMI AI Device",
    description: "Tasks involving interaction with OMI AI devices",
    disabled: true
  }
]

export function TaskTypeSelector() {
  const { formData, updateFormData } = useTaskForm()

  return (
    <div className="space-y-4">
      <Label>Task Type</Label>
      <Select
        value={formData.taskType}
        onValueChange={(value) => updateFormData("taskType", value as TaskType)}
      >
        <SelectTrigger>
          {formData.taskType ? taskTypes.find((type) => type.value === formData.taskType)?.label : "Select a task type"}
        </SelectTrigger>
        <SelectContent>
          {taskTypes.map((type) => (
            <SelectItem
              key={type.value}
              value={type.value}
              disabled={type.disabled}
            >
              <div>
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
