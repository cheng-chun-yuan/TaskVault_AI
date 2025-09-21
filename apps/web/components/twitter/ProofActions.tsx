import { Button } from "@workspace/ui/components/button";
import { Copy, ExternalLink } from "lucide-react";
import { Proof } from "@zk-email/sdk";
import { useCopyToClipboard } from "@/hooks";

interface ProofActionsProps {
  proof: Proof;
  txHash: string;
}

export function ProofActions({ proof, txHash }: ProofActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const handleCopyProof = () => {
    const proofData = JSON.stringify({
      proofData: proof.props.proofData,
      publicData: proof.props.publicData,
      externalInputs: proof.props.externalInputs,
      isLocal: proof.props.isLocal,
    }, null, 2);
    copyToClipboard(proofData);
  };

  const handleViewExplorer = () => {
    const explorerUrl = txHash 
      ? `https://zkverify-testnet.subscan.io/extrinsic/${txHash}`
      : 'https://zkverify-testnet.subscan.io';
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="text-sm font-semibold text-gray-400">Proof Generated Successfully!</div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={handleCopyProof}
        >
          <Copy className="h-4 w-4 mr-2" />
          {isCopied ? "Copied!" : "Copy Proof"}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={handleViewExplorer}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on zkVerify Explorer
        </Button>
      </div>
    </div>
  );
}