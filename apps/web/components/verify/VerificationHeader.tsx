import { ShieldCheck } from "lucide-react";

export function VerificationHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Social Verification
        </h1>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base">
        Verify your Twitter/X identity using zero-knowledge proofs or Reclaim Protocol&apos;s privacy-preserving verification.
      </p>
    </div>
  );
}
