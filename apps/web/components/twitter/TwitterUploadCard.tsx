import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Upload, Zap, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface TwitterUploadCardProps {
  address: string | undefined;
  fileContent: string;
  isLoading: "client" | "server" | "verifying" | null;
  verificationStatus: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProof: (mode: "client" | "server") => void;
}

export function TwitterUploadCard({ 
  address, 
  fileContent, 
  isLoading, 
  verificationStatus,
  onFileUpload, 
  onGenerateProof 
}: TwitterUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-600" />
          Verify Your Twitter
        </CardTitle>
        <CardDescription>
          {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect your wallet first"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Twitter Email</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              onChange={onFileUpload}
              className="hidden"
              id="email-upload"
              accept=".eml,.txt"
            />
            <label htmlFor="email-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {fileContent ? "✅ Email loaded" : "Click to upload email file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .eml and .txt files
              </p>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onGenerateProof("client")}
            disabled={!fileContent || !address || isLoading !== null}
            className="w-full"
            variant="default"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading === "client" ? "Generating in Browser..." : "Generate Proof (Browser)"}
          </Button>
          
          <Button
            onClick={() => onGenerateProof("server")}
            disabled={!fileContent || !address || isLoading !== null}
            className="w-full"
            variant="secondary"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isLoading === "server" ? "Generating on Server..." : "Generate Proof (Server)"}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isLoading === "verifying" 
                ? "Verifying proof on zkVerify network..." 
                : "Generating zero-knowledge proof... This may take several minutes."
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Status */}
        {verificationStatus && (
          <Alert className={verificationStatus.includes("✅") ? "border-green-200 bg-green-50" : 
                          verificationStatus.includes("❌") ? "border-red-200 bg-red-50" : ""}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>zkVerify Status:</strong> {verificationStatus}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}