"use client"

import { TaskCard } from "@/components/common"
import { useTasks } from "@/hooks"
import { LoadingSpinner, EmptyState } from "@/components/ui/feedback"
import { FileText } from "lucide-react"

export default function TasksPageContent() {
  const { data: filteredTasks = [], isLoading } = useTasks()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading tasks...</p>
      </div>
    )
  }

  if (filteredTasks.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            deadline={task.deadline.toLocaleDateString()}
            prize={`${task.prize} ETH`}
            status={task.status}
            submissions={task.submissions}
            creator={task.creator}
          />
        ))}
      </div>
    )
  }

  return (
    <EmptyState
      icon={FileText}
      title="No tasks available"
      description="Be the first to create a task and start building the future! Join our community of builders and innovators."
      action={{
        label: "Create First Task",
        href: "/create"
      }}
      size="lg"
    />
  )
}