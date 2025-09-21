import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle } from "lucide-react";
import { Proof } from "@zk-email/sdk";

interface TwitterProofDisplayProps {
  proof: Proof;
}

export function TwitterProofDisplay({ proof }: TwitterProofDisplayProps) {
  const formatProofAsStr = (proof: Proof) =>
    JSON.stringify(
      {
        proofData: proof.props.proofData,
        publicData: proof.props.publicData,
        externalInputs: proof.props.externalInputs,
        isLocal: proof.props.isLocal,
      },
      null,
      2
    );

  const handleCopyProof = () => {
    navigator.clipboard.writeText(formatProofAsStr(proof));
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Generated Zero-Knowledge Proof
        </CardTitle>
        <CardDescription>
          Your Twitter ownership proof is ready. This can be used to verify your identity on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[400px]">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {formatProofAsStr(proof)}
          </pre>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleCopyProof}>
            Copy Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}