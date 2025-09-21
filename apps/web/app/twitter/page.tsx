"use client";

import { useState } from "react";
import zkeSdk, { Proof, ExternalInputInput } from "@zk-email/sdk";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Progress } from "@workspace/ui/components/progress";
import { Upload, Zap, Shield, CheckCircle, AlertCircle, Twitter, ExternalLink } from "lucide-react";
// Note: zkVerify integration now handled securely via backend API

const blueprintSlug = "wryonik/twitter@v3";

export default function Home() {
  const sdk = zkeSdk();
  const { address } = useAccount();

  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState<"client" | "server" | "verifying" | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");

  const externalInputs: ExternalInputInput[] = [
    { name: "address", value: address || "", maxLength: 1094 },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const generateProof = async (mode: "client" | "server") => {
    if (!fileContent) {
      alert("Please upload a Twitter email first.");
      return;
    }
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsLoading(mode);
      setProof(null);

      const blueprint = await sdk.getBlueprint(blueprintSlug);
      const prover = blueprint.createProver({ isLocal: mode === "client" });

      console.log(`Generating proof using ${mode} mode`, externalInputs);

      const generatedProof = await prover.generateProof(
        fileContent,
        externalInputs
      );

      console.log("Got proof:", generatedProof);
      setProof(generatedProof);

      // Use secure backend zkVerify verification
      setIsLoading("verifying");
      setVerificationStatus("Preparing proof for verification...");
      
      try {
        // Get verification key from blueprint
        const vkey = await blueprint.getVkey();
        
        setVerificationStatus("Submitting proof to zkVerify (via secure backend)...");
        
        // Submit proof to secure backend API
        const response = await fetch('/api/zkverify/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vkey: vkey,
            proof: generatedProof.props.proofData,
            publicSignals: generatedProof.props.publicOutputs
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log("Proof verified successfully:", result);
          setVerificationStatus(`✅ Proof verified and included in block: ${result.blockHash}`);
          console.log("Transaction hash:", result.txHash);
        } else {
          throw new Error(result.error || 'Verification failed');
        }
        
      } catch (submitError) {
        console.error("Error submitting proof for verification:", submitError);
        const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown error';
        setVerificationStatus(`❌ Failed to verify proof: ${errorMessage}`);
      } finally {
        setIsLoading(null);
      }
    } catch (err) {
      console.error(`Error generating proof (${mode}):`, err);
      alert("Failed to generate proof. Check the console for details.");
    } finally {
      setIsLoading(null);
    }
  };


  const formatProofAsStr = (proof: Proof) =>
    JSON.stringify(
      {
        proofData: proof.props.proofData,
        publicData: proof.props.publicData,
        externalInputs: proof.props.externalInputs,
        isLocal: proof.props.isLocal,
      },
      null,
      2
    );

  const getProgressValue = () => {
    if (!fileContent) return 0;
    if (isLoading === "client" || isLoading === "server") return 33;
    if (isLoading === "verifying") return 66;
    if (proof && verificationStatus.includes("✅")) return 100;
    return 0;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header Section */}
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

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Verification Progress</CardTitle>
            <Badge variant={proof && verificationStatus.includes("✅") ? "default" : "secondary"}>
              {getProgressValue()}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getProgressValue()} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Upload Email</span>
            <span>Generate Proof</span>
            <span>Verify on-chain</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              How to Verify
            </CardTitle>
            <CardDescription>
              Follow these steps to prove your Twitter ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="text-sm">
                  <p className="font-medium">Request Password Reset</p>
                  <p className="text-muted-foreground">Send yourself a password reset email from Twitter</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="text-sm">
                  <p className="font-medium">Download Email</p>
                  <p className="text-muted-foreground">Sign in with Gmail and download the Twitter email as .eml file</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="text-sm">
                  <p className="font-medium">Upload & Verify</p>
                  <p className="text-muted-foreground">Upload the file and generate your zero-knowledge proof</p>
                </div>
              </div>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your email content stays private. Only the proof of ownership is shared.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Upload and Verification Card */}
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
                  onChange={handleFileUpload}
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
                onClick={() => generateProof("client")}
                disabled={!fileContent || !address || isLoading !== null}
                className="w-full"
                variant="default"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading === "client" ? "Generating in Browser..." : "Generate Proof (Browser)"}
              </Button>
              
              <Button
                onClick={() => generateProof("server")}
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
      </div>

      {/* Proof Display */}
      {proof && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Zero-Knowledge Proof
            </CardTitle>
            <CardDescription>
              Your Twitter ownership proof is ready. This can be used to verify your identity on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[400px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {formatProofAsStr(proof)}
              </pre>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on zkVerify Explorer
              </Button>
              <Button variant="outline" size="sm">
                Copy Proof Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
