import { ShieldCheck } from "lucide-react";

export function ReclaimVerificationHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Reclaim Protocol Verification
        </h1>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base">
        Verify your identity and data using Reclaim Protocol&apos;s privacy-preserving verification system.
      </p>
    </div>
  );
}
