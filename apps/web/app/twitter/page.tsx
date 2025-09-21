"use client";

import { TwitterVerificationHeader } from "@/components/twitter/TwitterVerificationHeader";
import { TwitterProgressCard } from "@/components/twitter/TwitterProgressCard";
import { TwitterInstructionsCard } from "@/components/twitter/TwitterInstructionsCard";
import { TwitterUploadCard } from "@/components/twitter/TwitterUploadCard";
import { TwitterProofDisplay } from "@/components/twitter/TwitterProofDisplay";
import { useFileUpload, useProofGeneration, useWalletAddress } from "@/hooks";

export default function TwitterPage() {
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
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 max-w-4xl">
      <TwitterVerificationHeader />
      
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
    </div>
  );
}
