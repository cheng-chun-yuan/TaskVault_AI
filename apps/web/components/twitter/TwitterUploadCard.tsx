import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Zap } from "lucide-react";
import { Proof } from "@zk-email/sdk";
import { FileUploadArea } from "./FileUploadArea";
import { ProofGenerationOptions } from "./ProofGenerationOptions";
import { StatusDisplay } from "./StatusDisplay";
import { ProofActions } from "./ProofActions";

interface TwitterUploadCardProps {
  address: string | undefined;
  fileContent: string;
  isLoading: "client" | "server" | "verifying" | null;
  verificationStatus: string;
  proof: Proof | null;
  txHash: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProof: (mode: "client" | "server") => void;
}

export function TwitterUploadCard({ 
  address, 
  fileContent, 
  isLoading, 
  verificationStatus,
  proof,
  txHash,
  onFileUpload, 
  onGenerateProof 
}: TwitterUploadCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          Generate Proof
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Upload your Twitter email and choose how to generate your zero-knowledge proof
          <div className="mt-2">
            {address ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Connect your wallet first
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <FileUploadArea 
          fileContent={fileContent} 
          onFileUpload={onFileUpload} 
        />
        
        <ProofGenerationOptions
          fileContent={fileContent}
          address={address}
          isLoading={isLoading}
          onGenerateProof={onGenerateProof}
        />

        <StatusDisplay 
          isLoading={isLoading} 
          verificationStatus={verificationStatus} 
        />

        {proof && (
          <ProofActions 
            proof={proof} 
            txHash={txHash} 
          />
        )}
      </CardContent>
    </Card>
  );
}