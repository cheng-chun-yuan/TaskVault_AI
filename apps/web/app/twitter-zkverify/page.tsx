"use client";

import { useState } from "react";
import zkeSdk, { Proof, ExternalInputInput } from "@zk-email/sdk";
import { zkVerifySession, Library, CurveType } from "zkverifyjs";
import { useAccount } from "wagmi";

const blueprintSlug = "wryonik/twitter@v3";

interface ZkVerifyResult {
  transactionHash?: string;
  blockHash?: string;
  blockNumber?: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export default function TwitterZkVerify() {
  const sdk = zkeSdk();
  const { address } = useAccount();

  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState<"generating" | "verifying" | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [zkVerifyResult, setZkVerifyResult] = useState<ZkVerifyResult | null>(null);

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
      setIsLoading("generating");
      setProof(null);
      setZkVerifyResult(null);

      const blueprint = await sdk.getBlueprint(blueprintSlug);
      const prover = blueprint.createProver({ isLocal: mode === "client" });

      console.log(`Generating proof using ${mode} mode`, externalInputs);

      const generatedProof = await prover.generateProof(
        fileContent,
        externalInputs
      );

      console.log("Got proof:", generatedProof);
      setProof(generatedProof);

      // Now verify using zkVerify instead of on-chain verification
      await verifyWithZkVerify(generatedProof, blueprint);

    } catch (err) {
      console.error(`Error generating proof (${mode}):`, err);
      alert("Failed to generate proof. Check the console for details.");
    } finally {
      setIsLoading(null);
    }
  };

  const verifyWithZkVerify = async (proof: Proof, blueprint: any) => {
    try {
      setIsLoading("verifying");
      setZkVerifyResult({ status: 'pending' });

      // Get verification key from blueprint
      const vkey = await blueprint.getVkey();
      
      // Extract proof data in the format expected by zkVerify
      const proofData = {
        vk: vkey,
        proof: proof.props.proofData.proof,
        publicSignals: proof.props.proofData.publicInputs
      };

      console.log("Verifying proof with zkVerify...", proofData);

      // Initialize zkVerify session
      // Note: You'll need to provide a seed phrase or private key for the Volta network
      // For demo purposes, this would need to be configured with proper credentials
      const session = await zkVerifySession
        .start()
        .Volta()
        .withAccount("your-seed-phrase-here"); // Replace with actual credentials

      // Submit proof for verification
      const result = await session
        .verify()
        .groth16({
          library: Library.snarkjs,
          curve: CurveType.bn128
        })
        .execute({ proofData });

      console.log("zkVerify result:", result);

      // Listen for transaction inclusion
      result.on('includedInBlock', (data) => {
        console.log("Proof included in block:", data);
        setZkVerifyResult({
          status: 'success',
          transactionHash: data.transactionHash,
          blockHash: data.blockHash,
          blockNumber: data.blockNumber
        });
      });

      result.on('error', (error) => {
        console.error("zkVerify error:", error);
        setZkVerifyResult({
          status: 'failed',
          error: error.message
        });
      });

    } catch (error) {
      console.error("zkVerify verification failed:", error);
      setZkVerifyResult({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] p-8 sm:p-20 font-sans items-center justify-items-center">
      <h1 className="text-2xl font-bold text-center">
        ZK Email Proof with zkVerify: Twitter Badge Verifier
      </h1>

      <div className="max-w-xl w-full mt-8 space-y-6">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm leading-relaxed">
          <strong className="block mb-1">Instructions:</strong>
          1. Send yourself a password reset email from Twitter.<br />
          2. Sign in with Gmail and download the most recent Twitter email.<br />
          3. Upload the email file below.<br />
          4. Click "Generate Proof" to create a ZK proof and verify it using zkVerify.
          <br /><br />
          <strong>zkVerify Integration:</strong> This demo integrates with zkVerify's 
          Volta network to provide decentralized proof verification.
        </div>

        <input
          type="file"
          onChange={handleFileUpload}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />

        <div className="flex gap-4">
          <button
            onClick={() => generateProof("client")}
            disabled={isLoading === "generating"}
            className="rounded-full bg-violet-50 text-violet-700 px-6 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading === "generating" ? "Generating..." : "Generate Proof (Browser)"}
          </button>
          <button
            onClick={() => generateProof("server")}
            disabled={isLoading === "generating"}
            className="rounded-full bg-violet-50 text-violet-700 px-6 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading === "generating" ? "Generating..." : "Generate Proof (Remote)"}
          </button>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-600">
            {isLoading === "generating" && "Generating ZK proof, this may take several minutes..."}
            {isLoading === "verifying" && "Verifying proof with zkVerify on Volta network..."}
          </div>
        )}

        {zkVerifyResult && (
          <div className={`p-4 rounded-lg text-sm ${
            zkVerifyResult.status === 'success' ? 'bg-green-50 text-green-800' :
            zkVerifyResult.status === 'failed' ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}>
            <strong className="block mb-2">zkVerify Status: {zkVerifyResult.status}</strong>
            {zkVerifyResult.transactionHash && (
              <div>Transaction: {zkVerifyResult.transactionHash}</div>
            )}
            {zkVerifyResult.blockNumber && (
              <div>Block Number: {zkVerifyResult.blockNumber}</div>
            )}
            {zkVerifyResult.error && (
              <div>Error: {zkVerifyResult.error}</div>
            )}
          </div>
        )}

        {proof && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg overflow-auto max-h-[500px] text-sm whitespace-pre-wrap">
            <strong className="block mb-2">Generated ZK Proof:</strong>
            <pre>{formatProofAsStr(proof)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}