"use client";

import dynamic from "next/dynamic";
import { useReclaimVerification, useWalletAddress } from "@/hooks";
import { ReclaimInstructionsCard } from "@/components/reclaim/ReclaimInstructionsCard";

// Dynamically import components that use browser APIs with no SSR
const ReclaimProgressCard = dynamic(() => import("@/components/reclaim/ReclaimProgressCard").then(mod => ({ default: mod.ReclaimProgressCard })), { ssr: false });
const ReclaimVerificationCard = dynamic(() => import("@/components/reclaim/ReclaimVerificationCard").then(mod => ({ default: mod.ReclaimVerificationCard })), { ssr: false });
const ReclaimProofDisplay = dynamic(() => import("@/components/reclaim/ReclaimProofDisplay").then(mod => ({ default: mod.ReclaimProofDisplay })), { ssr: false });

export default function ReclaimPageContent() {
  const address = useWalletAddress();
  const {
    proofs,
    isLoading,
    verificationStatus,
    error,
    startVerification
  } = useReclaimVerification();

  return (
    <>
      <ReclaimProgressCard
        isLoading={isLoading}
        proofs={proofs}
        verificationStatus={verificationStatus}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        <ReclaimInstructionsCard />

        <ReclaimVerificationCard
          address={address}
          isLoading={isLoading}
          verificationStatus={verificationStatus}
          proofs={proofs}
          error={error}
          onStartVerification={startVerification}
        />
      </div>

      {proofs && proofs.length > 0 && <ReclaimProofDisplay proofs={proofs} />}
    </>
  );
}
