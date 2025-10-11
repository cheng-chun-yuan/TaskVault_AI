import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ShieldCheck, Smartphone, QrCode, Chrome } from "lucide-react";

export function ReclaimInstructionsCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          How It Works
        </CardTitle>
        <CardDescription>
          Verify your data privately using Reclaim Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
              1
            </Badge>
            <div className="space-y-1">
              <p className="font-medium text-sm">Connect Your Wallet</p>
              <p className="text-xs text-muted-foreground">
                Ensure your wallet is connected to start the verification process
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
              2
            </Badge>
            <div className="space-y-1">
              <p className="font-medium text-sm">Start Verification</p>
              <p className="text-xs text-muted-foreground">
                Click "Start Verification" to begin the Reclaim Protocol flow
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
              3
            </Badge>
            <div className="space-y-1">
              <p className="font-medium text-sm">Complete Verification</p>
              <p className="text-xs text-muted-foreground">
                Follow the prompts based on your device:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 mt-2">
                <li className="flex items-center gap-2">
                  <Chrome className="h-3 w-3" />
                  Desktop: Browser extension or QR code
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone className="h-3 w-3" />
                  Mobile: App clip or Instant App
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
              4
            </Badge>
            <div className="space-y-1">
              <p className="font-medium text-sm">Receive Proof</p>
              <p className="text-xs text-muted-foreground">
                Get your cryptographic proof without exposing sensitive data
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> The verification flow automatically detects your device and provides the best experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
