import { Badge } from "@workspace/ui/components/badge";
import { Shield, CheckCircle, Twitter } from "lucide-react";

export function TwitterVerificationHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Twitter className="h-8 w-8 text-blue-600" />
        </div>
        <Shield className="h-6 w-6 text-gray-400" />
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Twitter Identity Verifier
      </h1>
      <p className="text-xl text-muted-foreground">
        Prove Twitter ownership with Zero-Knowledge proofs
      </p>
      <Badge variant="secondary" className="mt-2">
        Powered by zkEmail & zkVerify
      </Badge>
    </div>
  );
}