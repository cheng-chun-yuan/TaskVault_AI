"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { TaskCard } from "@/components/common"
import { useTasks } from "@/hooks"
import { LoadingSpinner, EmptyState } from "@/components/ui/feedback"
import { FileText, Plus } from "lucide-react"

export default function TasksPage() {
  const { data: filteredTasks = [], isLoading } = useTasks()
  

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Tasks</h1>
          <p className="text-muted-foreground mt-1">Find tasks that match your skills and earn rewards</p>
        </div>
        <Button asChild>
          <Link href="/create">Create New Task</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
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
      ) : (
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
      )}
    </div>
  )
}
