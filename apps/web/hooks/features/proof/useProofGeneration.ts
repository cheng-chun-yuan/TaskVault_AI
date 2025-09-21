import { useState } from "react";
import zkeSdk, { Proof, ExternalInputInput } from "@zk-email/sdk";
import { useWalletAddress } from "@/hooks/core/useWallet";
import { useAsync } from "@/hooks/core/useAsync";
import type { LoadingMode } from "@/types";

const blueprintSlug = "wryonik/twitter@v3";

interface UseProofGenerationProps {
  fileContent: string;
}

interface UseProofGenerationReturn {
  proof: Proof | null;
  isLoading: LoadingMode;
  verificationStatus: string;
  txHash: string;
  generateProof: (mode: "client" | "server") => Promise<void>;
  resetProof: () => void;
}

export function useProofGeneration({ 
  fileContent 
}: UseProofGenerationProps): UseProofGenerationReturn {
  const [proof, setProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState<LoadingMode>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const address = useWalletAddress();
  const { execute: executeAsync } = useAsync();
  const sdk = zkeSdk();

  const externalInputs: ExternalInputInput[] = [
    { name: "address", value: address || "", maxLength: 64 },
  ];

  const generateProof = async (mode: "client" | "server") => {
    if (!fileContent) {
      alert("Please upload a Twitter email first.");
      return;
    }
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsLoading(mode);
      setProof(null);
      setVerificationStatus("");
      setTxHash("");

      const blueprint = await sdk.getBlueprint(blueprintSlug);
      const prover = blueprint.createProver({ isLocal: mode === "client" });

      const generatedProof = await prover.generateProof(
        fileContent,
        externalInputs
      );

      console.log("Got proof:", generatedProof);
      setProof(generatedProof);

      // Use secure backend zkVerify verification
      setIsLoading("verifying");
      setVerificationStatus("Preparing proof for verification...");
      
      try {
        // Get verification key from blueprint
        const vkey = await blueprint.getVkey();
        console.log("Vkey:", vkey);
        setVerificationStatus("Submitting proof to zkVerify (via secure backend)...");
        
        // Submit proof to secure backend API
        const response = await fetch('/api/zkverify/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vkey: vkey,
            proof: generatedProof.props.proofData,
            publicSignals: generatedProof.props.publicOutputs
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log("Proof verified successfully:", result);
          setVerificationStatus(`✅ Proof verified and included in block: ${result.blockHash}`);
          setTxHash(result.txHash);
          console.log("Transaction hash:", result.txHash);
        } else {
          throw new Error(result.error || 'Verification failed');
        }
        
      } catch (submitError) {
        console.error("Error submitting proof for verification:", submitError);
        const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown error';
        setVerificationStatus(`❌ Failed to verify proof: ${errorMessage}`);
      } finally {
        setIsLoading(null);
      }
    } catch (err) {
      console.error(`Error generating proof (${mode}):`, err);
      alert("Failed to generate proof. Check the console for details.");
    } finally {
      setIsLoading(null);
    }
  };

  const resetProof = () => {
    setProof(null);
    setVerificationStatus("");
    setTxHash("");
    setIsLoading(null);
  };

  return {
    proof,
    isLoading,
    verificationStatus,
    txHash,
    generateProof,
    resetProof,
  };
}