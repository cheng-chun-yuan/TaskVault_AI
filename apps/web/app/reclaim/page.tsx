"use client";

import dynamicImport from "next/dynamic";
import { ReclaimVerificationHeader } from "@/components/reclaim/ReclaimVerificationHeader";

// Force dynamic rendering to prevent SSR issues with Reclaim SDK
export const dynamic = 'force-dynamic'

// Dynamically import the hook-using component
const ReclaimPageContent = dynamicImport(() => import("./ReclaimPageContent"), { ssr: false });

export default function ReclaimPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 max-w-4xl">
      <ReclaimVerificationHeader />
      <ReclaimPageContent />
    </div>
  );
}
