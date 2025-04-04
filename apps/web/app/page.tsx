import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight, Award, CheckCircle, ClipboardList } from "lucide-react"
import RainingLettersSection from "@/components/landing/RainingLettersBackground"
import LandingSection from "@/components/landing/RainingLettersSection"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <LandingSection/>

      {/* Process Flow */}
      <section className="py-16 px-4 md:px-6 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: "Create",
                icon: <ClipboardList className="h-10 w-10 mb-4 text-primary" />,
                description: "Define your task with clear criteria and set a reward",
              },
              {
                title: "Submit",
                icon: <ArrowRight className="h-10 w-10 mb-4 text-primary" />,
                description: "Participants submit their solutions before the deadline",
              },
              {
                title: "Judge",
                icon: <CheckCircle className="h-10 w-10 mb-4 text-primary" />,
                description: "AI evaluates submissions based on predefined criteria",
              },
              {
                title: "Reward",
                icon: <Award className="h-10 w-10 mb-4 text-primary" />,
                description: "Winners receive rewards automatically and transparently",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border"
              >
                {step.icon}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Tasks Preview */}
      <RainingLettersSection>
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Live Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Design a Logo for Web3 Project",
                deadline: "2 days left",
                reward: "0.5 ETH",
                status: "Open",
              },
              {
                title: "Smart Contract Security Audit",
                deadline: "5 days left",
                reward: "2 ETH",
                status: "Open",
              },
              {
                title: "Create Marketing Strategy",
                deadline: "Ended",
                reward: "1 ETH",
                status: "Judging",
              },
            ].map((task, i) => (
              <Link href={`/task/${i + 1}`} key={i} className="group">
                <div className="p-6 bg-background rounded-lg border border-border h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.status === "Open"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : task.status === "Judging"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-auto pt-4 flex justify-between text-sm text-muted-foreground">
                    <span>{task.deadline}</span>
                    <span className="font-mono">{task.reward}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link href="/tasks">View All Tasks</Link>
            </Button>
          </div>
        </div>

      </RainingLettersSection>
    </div>
  )
}