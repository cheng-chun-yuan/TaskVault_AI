"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { TaskCard } from "@/components/common"
import { useTask } from "@/context"
import { useEffect } from "react"

export default function TasksPage() {
  const { filteredTasks, isLoading, loadTasks } = useTask()
  
  useEffect(() => {
    loadTasks()
  }, [])
  

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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
              deadline={typeof task.deadline === 'string' ? task.deadline : task.deadline.toLocaleDateString()}
              prize={task.prize}
              status={task.status}
              submissions={task.submissions}
              creator={task.creator}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No tasks available</h3>
          <p className="text-muted-foreground mb-6">Be the first to create a task and start building the future!</p>
          <Button asChild>
            <Link href="/create">Create First Task</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
