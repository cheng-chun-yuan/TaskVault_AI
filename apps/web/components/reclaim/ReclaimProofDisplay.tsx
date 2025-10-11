import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2 } from "lucide-react";

interface ExtractedParameters {
  screen_name?: string;
  followers_count?: string;
  created_at?: string;
  URL_PARAM_DOMAIN?: string;
}

interface Proof {
  identifier: string;
  claimData?: {
    provider?: string;
    parameters?: string;
    context?: string;
    extractedParameters?: ExtractedParameters;
  };
  signatures?: unknown[];
}

interface ReclaimProofDisplayProps {
  proofs: Proof[];
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
              {proof.claimData && (
                <div>
                  <span className="font-semibold text-muted-foreground">Verified Data:</span>
                  <div className="mt-2 space-y-2">
                    {proof.claimData.provider && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Provider:</span>
                        <span className="text-xs break-all">{proof.claimData.provider}</span>
                      </div>
                    )}

                    {/* Extract context data if available */}
                    {(() => {
                      try {
                        const context = proof.claimData.context ? JSON.parse(proof.claimData.context) : null;
                        const extractedParams = context?.extractedParameters || {};
                        const providerHash = context?.providerHash;

                        return (
                          <>
                            {extractedParams.URL_PARAM_DOMAIN && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Domain:</span>
                                <span className="text-xs">{extractedParams.URL_PARAM_DOMAIN}</span>
                              </div>
                            )}
                            {extractedParams.screen_name && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Username:</span>
                                <span className="text-xs font-mono">@{extractedParams.screen_name}</span>
                              </div>
                            )}
                            {extractedParams.followers_count && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Followers:</span>
                                <span className="text-xs">{extractedParams.followers_count}</span>
                              </div>
                            )}
                            {extractedParams.created_at && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Created:</span>
                                <span className="text-xs">{extractedParams.created_at}</span>
                              </div>
                            )}
                            {providerHash && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-xs text-muted-foreground min-w-[80px]">Proof Hash:</span>
                                <span className="text-xs font-mono break-all">{providerHash}</span>
                              </div>
                            )}
                          </>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}

              {proof.signatures && proof.signatures.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    ✓ {proof.signatures.length} cryptographic signature{proof.signatures.length > 1 ? 's' : ''} verified
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
