import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { VerificationStatus } from "@/hooks/features/reclaim/useReclaimVerification";

interface Proof {
  identifier: string;
  claimData?: {
    provider?: string;
    parameters?: string;
    context?: string;
  };
  signatures?: unknown[];
}

interface ReclaimProgressCardProps {
  isLoading: boolean;
  proofs: Proof[] | null;
  verificationStatus: VerificationStatus;
}

export function ReclaimProgressCard({
  isLoading,
  proofs,
  verificationStatus
}: ReclaimProgressCardProps) {
  const steps = [
    {
      id: 1,
      label: "Connect Wallet",
      status: "completed" as const,
    },
    {
      id: 2,
      label: "Start Verification",
      status: isLoading || proofs ? "completed" : verificationStatus === 'error' ? 'error' : "pending" as const,
    },
    {
      id: 3,
      label: "Complete Flow",
      status: proofs ? "completed" : isLoading ? "active" : verificationStatus === 'error' ? 'error' : "pending" as const,
    },
    {
      id: 4,
      label: "Receive Proof",
      status: proofs ? "completed" : verificationStatus === 'error' ? 'error' : "pending" as const,
    },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${step.status === "completed"
                      ? "bg-green-500 text-white"
                      : step.status === "active"
                      ? "bg-blue-500 text-white animate-pulse"
                      : step.status === "error"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-400"
                    }
                  `}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : step.status === "active" ? (
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <Badge
                  variant={
                    step.status === "completed"
                      ? "default"
                      : step.status === "active"
                      ? "default"
                      : step.status === "error"
                      ? "destructive"
                      : "outline"
                  }
                  className="text-[10px] sm:text-xs whitespace-nowrap px-1.5 sm:px-2"
                >
                  {step.label}
                </Badge>
              </div>
              {index < steps.length - 1 && steps[index + 1] && (
                <div
                  className={`
                    h-[2px] w-full max-w-[60px] sm:max-w-[100px] mx-1 sm:mx-2
                    transition-all duration-300
                    ${steps[index + 1]?.status === "completed" || steps[index + 1]?.status === "active"
                      ? "bg-blue-500"
                      : steps[index + 1]?.status === "error"
                      ? "bg-red-500"
                      : "bg-gray-200"
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
