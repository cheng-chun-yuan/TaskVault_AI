"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { VerificationMethodSelector } from "@/components/verify/VerificationMethodSelector";
import { useFileUpload, useProofGeneration, useWalletAddress, useReclaimVerification } from "@/hooks";

// Dynamically import Twitter components
const TwitterProgressCard = dynamic(
  () => import("@/components/twitter/TwitterProgressCard").then((mod) => mod.TwitterProgressCard),
  { ssr: false }
);
const TwitterInstructionsCard = dynamic(
  () => import("@/components/twitter/TwitterInstructionsCard").then((mod) => mod.TwitterInstructionsCard),
  { ssr: false }
);
const TwitterUploadCard = dynamic(
  () => import("@/components/twitter/TwitterUploadCard").then((mod) => mod.TwitterUploadCard),
  { ssr: false }
);
const TwitterProofDisplay = dynamic(
  () => import("@/components/twitter/TwitterProofDisplay").then((mod) => mod.TwitterProofDisplay),
  { ssr: false }
);

// Dynamically import Reclaim components
const ReclaimProgressCard = dynamic(
  () => import("@/components/reclaim/ReclaimProgressCard").then((mod) => mod.ReclaimProgressCard),
  { ssr: false }
);
const ReclaimInstructionsCard = dynamic(
  () => import("@/components/reclaim/ReclaimInstructionsCard").then((mod) => mod.ReclaimInstructionsCard),
  { ssr: false }
);
const ReclaimVerificationCard = dynamic(
  () => import("@/components/reclaim/ReclaimVerificationCard").then((mod) => mod.ReclaimVerificationCard),
  { ssr: false }
);
const ReclaimProofDisplay = dynamic(
  () => import("@/components/reclaim/ReclaimProofDisplay").then((mod) => mod.ReclaimProofDisplay),
  { ssr: false }
);

export default function VerifyPageContent() {
  const [selectedMethod, setSelectedMethod] = useState<"zkemail" | "reclaim">("reclaim");
  const address = useWalletAddress();

  // zkEmail hooks
  const { fileContent, handleFileUpload } = useFileUpload();
  const {
    proof: zkProof,
    isLoading: zkLoading,
    verificationStatus: zkStatus,
    txHash,
    generateProof
  } = useProofGeneration({ fileContent });

  // Reclaim hooks
  const {
    proofs: reclaimProofs,
    isLoading: reclaimLoading,
    verificationStatus: reclaimStatus,
    error: reclaimError,
    startVerification: startReclaimVerification
  } = useReclaimVerification();

  return (
    <>
      <VerificationMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      {selectedMethod === "zkemail" ? (
        <>
          <TwitterProgressCard
            fileContent={fileContent}
            isLoading={zkLoading}
            proof={zkProof}
            verificationStatus={zkStatus}
          />

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <TwitterInstructionsCard />

            <TwitterUploadCard
              address={address}
              fileContent={fileContent}
              isLoading={zkLoading}
              verificationStatus={zkStatus}
              proof={zkProof}
              txHash={txHash}
              onFileUpload={handleFileUpload}
              onGenerateProof={generateProof}
            />
          </div>

          {zkProof && <TwitterProofDisplay proof={zkProof} />}
        </>
      ) : (
        <>
          <ReclaimProgressCard
            isLoading={reclaimLoading}
            proofs={reclaimProofs}
            verificationStatus={reclaimStatus}
          />

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <ReclaimInstructionsCard />

            <ReclaimVerificationCard
              address={address}
              isLoading={reclaimLoading}
              verificationStatus={reclaimStatus}
              proofs={reclaimProofs}
              error={reclaimError}
              onStartVerification={startReclaimVerification}
            />
          </div>

          {reclaimProofs && reclaimProofs.length > 0 && <ReclaimProofDisplay proofs={reclaimProofs} />}
        </>
      )}
    </>
  );
}
