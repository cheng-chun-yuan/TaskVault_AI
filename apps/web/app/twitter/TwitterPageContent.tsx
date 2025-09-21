"use client";

import dynamic from "next/dynamic";
import { useFileUpload, useProofGeneration, useWalletAddress } from "@/hooks";
import { TwitterInstructionsCard } from "@/components/twitter/TwitterInstructionsCard";

// Dynamically import components that use browser APIs with no SSR
const TwitterProgressCard = dynamic(() => import("@/components/twitter/TwitterProgressCard").then(mod => ({ default: mod.TwitterProgressCard })), { ssr: false });
const TwitterUploadCard = dynamic(() => import("@/components/twitter/TwitterUploadCard").then(mod => ({ default: mod.TwitterUploadCard })), { ssr: false });
const TwitterProofDisplay = dynamic(() => import("@/components/twitter/TwitterProofDisplay").then(mod => ({ default: mod.TwitterProofDisplay })), { ssr: false });

export default function TwitterPageContent() {
  // Custom hooks for cleaner state management
  const address = useWalletAddress();
  const { fileContent, handleFileUpload } = useFileUpload();
  const { 
    proof, 
    isLoading, 
    verificationStatus, 
    txHash, 
    generateProof 
  } = useProofGeneration({ fileContent });

  return (
    <>
      <TwitterProgressCard 
        fileContent={fileContent}
        isLoading={isLoading}
        proof={proof}
        verificationStatus={verificationStatus}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        <TwitterInstructionsCard />
        
        <TwitterUploadCard 
          address={address}
          fileContent={fileContent}
          isLoading={isLoading}
          verificationStatus={verificationStatus}
          proof={proof}
          txHash={txHash}
          onFileUpload={handleFileUpload}
          onGenerateProof={generateProof}
        />
      </div>

      {proof && <TwitterProofDisplay proof={proof} />}
    </>
  );
}