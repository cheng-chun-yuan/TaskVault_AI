import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { ShieldCheck, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

interface ReclaimVerificationCardProps {
  address: string | undefined;
  isLoading: boolean;
  verificationStatus: VerificationStatus;
  proofs: Proof[] | null;
  error: string | null;
  onStartVerification: () => void;
}

export function ReclaimVerificationCard({
  address,
  isLoading,
  verificationStatus,
  proofs,
  error,
  onStartVerification
}: ReclaimVerificationCardProps) {
  const getStatusDisplay = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (proofs && proofs.length > 0) {
      return (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Verification successful! {proofs.length} proof{proofs.length > 1 ? 's' : ''} received.
          </AlertDescription>
        </Alert>
      );
    }

    if (verificationStatus === 'verifying') {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Verification in progress... Please complete the verification flow.
          </AlertDescription>
        </Alert>
      );
    }

    if (verificationStatus === 'loading') {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Initializing verification...
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
          </div>
          Start Verification
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Verify your data using Reclaim Protocol
          <div className="mt-2">
            {address ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Connect your wallet first
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-4">
          <Button
            onClick={onStartVerification}
            disabled={!address || isLoading || verificationStatus === 'success'}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : verificationStatus === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verified
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Start Verification
              </>
            )}
          </Button>

          {getStatusDisplay()}

          <div className="text-xs text-muted-foreground space-y-2 pt-2 border-t">
            <p><strong>What happens next?</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>The verification flow will open automatically</li>
              <li>Complete the verification in your preferred method</li>
              <li>Your proof will be generated securely</li>
              <li>No sensitive data leaves your device</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
