import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Mail, Globe, Check } from "lucide-react";

interface VerificationMethodSelectorProps {
  selectedMethod: "zkemail" | "reclaim";
  onMethodChange: (method: "zkemail" | "reclaim") => void;
}

export function VerificationMethodSelector({
  selectedMethod,
  onMethodChange,
}: VerificationMethodSelectorProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Choose Verification Method</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* zkEmail Method */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMethod === "zkemail"
              ? "ring-2 ring-primary shadow-lg"
              : "hover:border-primary/50"
          }`}
          onClick={() => onMethodChange("zkemail")}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">zkEmail</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Zero-Knowledge
                  </Badge>
                </div>
              </div>
              {selectedMethod === "zkemail" && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Prove Twitter ownership using password reset emails with zero-knowledge proofs
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Upload Twitter email (.eml or .txt)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Generate proof locally or on server
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Email stays private with ZK proofs
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Reclaim Protocol Method */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMethod === "reclaim"
              ? "ring-2 ring-primary shadow-lg"
              : "hover:border-primary/50"
          }`}
          onClick={() => onMethodChange("reclaim")}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Reclaim Protocol</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Privacy-First
                  </Badge>
                </div>
              </div>
              {selectedMethod === "reclaim" && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Verify your Twitter data using Reclaim&apos;s privacy-preserving attestations
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                One-click browser verification
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Mobile app clip support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Verify followers, creation date & more
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
