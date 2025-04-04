import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between max-w-xl mx-auto mb-8 relative">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i + 1} className="flex flex-col items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2",
              currentStep === i + 1
                ? "border-primary bg-primary text-primary-foreground"
                : currentStep > i + 1
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-muted bg-muted text-muted-foreground",
            )}
          >
            {currentStep > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
          </div>
          <span className="text-xs text-muted-foreground">
            {i + 1 === 1 ? "Details" : i + 1 === 2 ? "Verification" : i + 1 === 3 ? "Judges" : "Prize"}
          </span>
        </div>
      ))}
      <div className="absolute left-0 right-0 h-0.5 bg-muted -z-10" style={{ top: "1.25rem" }}></div>
    </div>
  )
}
