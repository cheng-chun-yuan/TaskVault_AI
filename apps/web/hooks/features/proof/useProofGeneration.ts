import { useState, useEffect } from "react";
import { default as zkeSdk, Proof, ExternalInputInput } from "@zk-email/sdk";
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
  const [sdk, setSdk] = useState<ReturnType<typeof zkeSdk> | null>(null);

  const address = useWalletAddress();
  const { execute: executeAsync } = useAsync();

  // Initialize SDK only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSdk(zkeSdk());
    }
  }, []);

  const externalInputs: ExternalInputInput[] = [
    { name: "address", value: address || "", maxLength: 64 },
  ];

  const generateProof = async (mode: "client" | "server") => {
    if (!fileContent) {
      console.warn("Please upload a Twitter email first.");
      return;
    }
    if (!address) {
      console.warn("Please connect your wallet first.");
      return;
    }
    if (!sdk) {
      console.warn("SDK not initialized yet. Please wait...");
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
      setVerificationStatus(`❌ Failed to generate proof: ${err instanceof Error ? err.message : 'Unknown error'}`);
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