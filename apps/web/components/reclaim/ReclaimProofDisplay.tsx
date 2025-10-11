import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2 } from "lucide-react";

interface ReclaimProofDisplayProps {
  proofs: any[];
}

export function ReclaimProofDisplay({ proofs }: ReclaimProofDisplayProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Verification Proofs
        </CardTitle>
        <CardDescription>
          Your cryptographic proofs from Reclaim Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {proofs.map((proof, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Proof #{index + 1}</Badge>
              <Badge variant="default" className="bg-green-500">Verified</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Identifier:</span>
                <p className="font-mono text-xs break-all mt-1">{proof.identifier}</p>
              </div>

              {proof.claimData && (
                <div>
                  <span className="font-semibold text-muted-foreground">Claim Data:</span>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs"><span className="font-medium">Provider:</span> {proof.claimData.provider}</p>
                    {proof.claimData.parameters && (
                      <p className="text-xs"><span className="font-medium">Parameters:</span> {proof.claimData.parameters}</p>
                    )}
                    {proof.claimData.context && (
                      <p className="text-xs"><span className="font-medium">Context:</span> {proof.claimData.context}</p>
                    )}
                  </div>
                </div>
              )}

              {proof.signatures && proof.signatures.length > 0 && (
                <div>
                  <span className="font-semibold text-muted-foreground">Signatures:</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {proof.signatures.length} signature{proof.signatures.length > 1 ? 's' : ''} included
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>✓ All proofs are cryptographically verified</p>
          <p>✓ Your sensitive data remains private</p>
        </div>
      </CardContent>
    </Card>
  );
}
