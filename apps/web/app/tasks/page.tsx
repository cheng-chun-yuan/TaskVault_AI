import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Calendar, Clock } from "lucide-react"

export default function TasksPage() {
  // Mock data - in a real app this would come from an API or blockchain
  const tasks = [
    {
      id: "1",
      title: "Design a Logo for Web3 Project",
      description:
        "Create a modern, professional logo for our Web3 project that represents decentralization and security.",
      deadline: "April 15, 2025",
      timeLeft: "2 days left",
      reward: "0.5 ETH",
      status: "Open",
      submissions: 5,
    },
    {
      id: "2",
      title: "Smart Contract Security Audit",
      description:
        "Perform a comprehensive security audit of our DeFi protocol smart contracts and provide a detailed report.",
      deadline: "April 20, 2025",
      timeLeft: "5 days left",
      reward: "2 ETH",
      status: "Open",
      submissions: 2,
    },
    {
      id: "3",
      title: "Create Marketing Strategy",
      description:
        "Develop a comprehensive marketing strategy for our NFT marketplace launch, including social media and community engagement.",
      deadline: "April 5, 2025",
      timeLeft: "Ended",
      reward: "1 ETH",
      status: "Judging",
      submissions: 8,
    },
    {
      id: "4",
      title: "Develop API Integration",
      description:
        "Create an integration between our platform and a popular third-party API for enhanced functionality.",
      deadline: "April 3, 2025",
      timeLeft: "Ended",
      reward: "1.5 ETH",
      status: "Closed",
      submissions: 6,
    },
    {
      id: "5",
      title: "Create a Landing Page for DeFi Protocol",
      description: "Design and implement a responsive landing page for our new DeFi protocol.",
      deadline: "April 15, 2025",
      timeLeft: "14 days left",
      reward: "2 ETH",
      status: "Open",
      submissions: 3,
    },
    {
      id: "demo",
      title: "UI/UX Design for Mobile App",
      description: "Design a clean, intuitive user interface for our mobile cryptocurrency wallet application.",
      deadline: "April 25, 2025",
      timeLeft: "24 days left",
      reward: "1.2 ETH",
      status: "Open",
      submissions: 0,
    },
  ]

  const statusColor = {
    Open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Judging: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <div className="container py-10 px-4 md:px-6">
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
        {tasks.map((task) => (
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

