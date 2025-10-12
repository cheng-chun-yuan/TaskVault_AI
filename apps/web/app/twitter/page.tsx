"use client";

import dynamicImport from "next/dynamic";
import { VerificationHeader } from "@/components/verify/VerificationHeader";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

// Dynamically import the hook-using component
const VerifyPageContent = dynamicImport(() => import("./VerifyPageContent"), { ssr: false });

export default function VerifyPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 max-w-6xl">
      <VerificationHeader />
      <VerifyPageContent />
    </div>
  );
}
