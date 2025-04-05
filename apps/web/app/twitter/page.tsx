"use client";

import { useState } from "react";
import zkeSdk, { Proof, ExternalInputInput } from "@zk-email/sdk";
import { useAccount } from "wagmi";

const blueprintSlug = "wryonik/twitter@v3";

export default function Home() {
  const sdk = zkeSdk();
  const { address } = useAccount();

  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState<"client" | "server" | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);

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

      const verified = await blueprint.verifyProofOnChain(generatedProof);
      console.log("Proof verified on-chain:", verified);
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

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] p-8 sm:p-20 font-sans items-center justify-items-center">
      <h1 className="text-2xl font-bold text-center">
        ZK Email Proof: Twitter Badge Verifier
      </h1>

      <div className="max-w-xl w-full mt-8 space-y-6">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm leading-relaxed">
          <strong className="block mb-1">Instructions:</strong>
          1. Send yourself a password reset email from Twitter.<br />
          2. Sign in with Gmail and download the most recent Twitter email.<br />
          3. Upload the email file below.<br />
          4. Click "Generate Proof" to verify ownership of the email and link it
          to your wallet address using ZK.
        </div>

        <input
          type="file"
          onChange={handleFileUpload}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />

        <div className="flex gap-4">
          <button
            onClick={() => generateProof("client")}
            disabled={isLoading === "client"}
            className="rounded-full bg-violet-50 text-violet-700 px-6 py-2 text-sm font-semibold"
          >
            {isLoading === "client" ? "Generating..." : "Generate Proof in Browser"}
          </button>
          <button
            onClick={() => generateProof("server")}
            disabled={isLoading === "server"}
            className="rounded-full bg-violet-50 text-violet-700 px-6 py-2 text-sm font-semibold"
          >
            {isLoading === "server" ? "Generating..." : "Generate Proof Remotely"}
          </button>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-600">
            Please wait, this may take several minutes...
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
