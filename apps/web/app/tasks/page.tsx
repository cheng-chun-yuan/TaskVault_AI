import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Calendar, Clock } from "lucide-react"
import { getAllTasks } from "@/lib/tasks"

export default async function TasksPage() {
  // Get tasks directly from the DB via getAllTasks
  const tasks = await getAllTasks();

  const statusColor = {
    Open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Judging: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task: any) => (
          <Link href={`/task/${task.id}`} key={task.id} className="group">
            <Card className="p-6 h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{task.title}</h3>
                <Badge className={statusColor[task.status as keyof typeof statusColor]}>{task.status}</Badge>
              </div>

              <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{task.description}</p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submissions</span>
                  <span>{task.submissions}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {task.deadline}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.timeLeft}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reward</span>
                    <span className="font-mono font-medium">{task.reward}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
