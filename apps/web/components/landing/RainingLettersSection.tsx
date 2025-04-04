import RainingLettersBackground from "@/components/landing/RainingLettersBackground"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import ScrambledTitle from "@/components/landing/ScrambledTitle"

const LandingSection = () => {
  return (
    <RainingLettersBackground>
      <div className="container mx-auto max-w-5xl text-center space-y-8">
        <ScrambledTitle />
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          TaskVault AI is a decentralized platform for creating tasks, submitting solutions, and getting fair AI
          judgments with transparent rewards.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button asChild size="lg" className="font-medium">
            <Link href="/create">Create Task</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-medium bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/task/demo">Try Demo</Link>
          </Button>
        </div>
      </div>
    </RainingLettersBackground>
  )
}

export default LandingSection
