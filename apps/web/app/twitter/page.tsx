"use client";

import dynamicImport from "next/dynamic";
import { TwitterVerificationHeader } from "@/components/twitter/TwitterVerificationHeader";

// Force dynamic rendering to prevent SSR issues with web3 hooks and zkEmail SDK
export const dynamic = 'force-dynamic'

// Dynamically import the hook-using component
const TwitterPageContent = dynamicImport(() => import("./TwitterPageContent"), { ssr: false });

export default function TwitterPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 max-w-4xl">
      <TwitterVerificationHeader />
      <TwitterPageContent />
    </div>
  );
}
