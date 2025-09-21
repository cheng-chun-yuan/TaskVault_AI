import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusDisplayProps {
  isLoading: "client" | "server" | "verifying" | null;
  verificationStatus: string;
}

export function StatusDisplay({ isLoading, verificationStatus }: StatusDisplayProps) {
  if (!isLoading && !verificationStatus) return null;

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <AlertDescription className="text-blue-800 font-medium">
            {isLoading === "verifying" 
              ? "Verifying proof on zkVerify network..." 
              : "Generating zero-knowledge proof... This may take several minutes."
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Status */}
      {verificationStatus && (
        <Alert className={`${
          verificationStatus.includes("✅") 
            ? "border-green-300 bg-green-50" 
            : verificationStatus.includes("❌") 
              ? "border-red-300 bg-red-50" 
              : "border-blue-300 bg-blue-50"
        }`}>
          <CheckCircle className={`h-4 w-4 ${
            verificationStatus.includes("✅") 
              ? "text-green-600" 
              : verificationStatus.includes("❌") 
                ? "text-red-600" 
                : "text-blue-600"
          }`} />
          <AlertDescription className={`font-medium ${
            verificationStatus.includes("✅") 
              ? "text-green-800" 
              : verificationStatus.includes("❌") 
                ? "text-red-800" 
                : "text-blue-800"
          }`}>
            <strong>zkVerify Status:</strong> {verificationStatus}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}