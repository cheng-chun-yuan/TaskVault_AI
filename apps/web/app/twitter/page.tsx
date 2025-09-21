"use client";

import { useState } from "react";
import zkeSdk, { Proof, ExternalInputInput } from "@zk-email/sdk";
import { useWallets } from "@privy-io/react-auth";
import { TwitterVerificationHeader } from "@/components/twitter/TwitterVerificationHeader";
import { TwitterProgressCard } from "@/components/twitter/TwitterProgressCard";
import { TwitterInstructionsCard } from "@/components/twitter/TwitterInstructionsCard";
import { TwitterUploadCard } from "@/components/twitter/TwitterUploadCard";
import { TwitterProofDisplay } from "@/components/twitter/TwitterProofDisplay";
// Note: zkVerify integration now handled securely via backend API

const blueprintSlug = "wryonik/twitter@v3";

export default function Home() {
  const sdk = zkeSdk();
  const { wallets } = useWallets();
  const address = wallets[0]?.address;

  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState<"client" | "server" | "verifying" | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");

  const externalInputs: ExternalInputInput[] = [
    { name: "address", value: address || "", maxLength: 64 },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

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



  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <TwitterVerificationHeader />
      
      <TwitterProgressCard 
        fileContent={fileContent}
        isLoading={isLoading}
        proof={proof}
        verificationStatus={verificationStatus}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <TwitterInstructionsCard />
        
        <TwitterUploadCard 
          address={address}
          fileContent={fileContent}
          isLoading={isLoading}
          verificationStatus={verificationStatus}
          onFileUpload={handleFileUpload}
          onGenerateProof={generateProof}
        />
      </div>

      {proof && <TwitterProofDisplay proof={proof} />}
    </div>
  );
}
