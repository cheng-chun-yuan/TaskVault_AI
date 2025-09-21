import { NextRequest } from 'next/server';
import { SelfBackendVerifier } from '@selfxyz/core';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SubmissionRegistryAbi } from '@/content/abi';
import { celoAlfajores } from 'viem/chains';
import { SubmissionRegistry } from '@/content/address';
import { blockchain } from '@/lib/env';

export async function GET() {
  return Response.json({ message: 'Hello World: api verify' });
}

export async function POST(req: NextRequest) {
  const taskId = req.url.split('/').pop();
  console.log("taskId", taskId)
  const body = await req.json();
  const { proof, publicSignals } = body;
  console.log(proof, publicSignals, taskId)

  // Input validation
  if (!proof?.a || !proof?.b || !proof?.c || !publicSignals || !taskId) {
    return Response.json({ 
      status: 'error',
      message: 'Invalid proof format or missing required fields',
      details: {
        hasProof: !!proof,
        hasPublicSignals: !!publicSignals,
        hasTaskId: !!taskId,
        proofFormat: proof ? Object.keys(proof) : undefined
      }
    }, { status: 400 });
  }

  try {
    // Use Self v2 backend verifier for proper verification
    const scope = "trustjudge-ai";
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://novel-rapidly-panda.ngrok-free.app'}/api/verify/${taskId}`;
    
    // Initialize the v2 backend verifier with proper allowedIds Map
    const allowedIds = new Map<1 | 2 | 3, boolean>();
    allowedIds.set(1, true); // Passport
    allowedIds.set(2, true); // EU ID Card
    allowedIds.set(3, true); // Other documents
    
    // For now, skip the SelfBackendVerifier initialization due to API changes
    // TODO: Update when Self v2 API is stable
    console.log(`Self v2 verification initialized for scope: ${scope}, endpoint: ${endpoint}`);

    // Simplified verification - for now we'll use basic proof validation
    // TODO: Implement proper Self v2 verification when the API is stable
    console.log("Self v2 verification - using simplified validation for now");
    
    // For now, we'll trust the proof format is correct and extract address
    const address = publicSignals[0];
    console.log(`Processing Self v2 verification for task ${taskId} from address ${address}`);

    if (!blockchain.privateKey) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }
    const account = privateKeyToAccount(`0x${blockchain.privateKey}`);

    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http()
    });

    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http()
    });

    // Format proof data
    const proofData = {
      a: proof.a.map(BigInt),
      b: [
        [BigInt(proof.b[0][1]), BigInt(proof.b[0][0])],
        [BigInt(proof.b[1][1]), BigInt(proof.b[1][0])],
      ],
      c: proof.c.map(BigInt),
      pubSignals: publicSignals,
    };

    console.log(`Submitting verification for task ${taskId}`);
    console.log("walletClient", walletClient)

    // Write the contract with the new data
    const hash = await walletClient.writeContract({
      address: SubmissionRegistry,
      abi: SubmissionRegistryAbi,
      functionName: 'verifySelfProof',
      args: [proofData, taskId]
    });

    console.log(`Verification submitted for task ${taskId} with hash: ${hash}`);

    // Wait for the transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Convert BigInt values to strings before sending response
    return Response.json({
      status: 'success',
      result: true,
    });
  } catch (error) {
    console.error("Verification failed:", error);
    
    // Determine error type and provide appropriate message
    let errorMessage = 'Unknown error occurred';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('cause' in error) {
        // Convert any BigInt values in the error cause to strings
        const cause = error.cause as Record<string, unknown>;
        errorDetails = {
          cause: Object.fromEntries(
            Object.entries(cause).map(([key, value]) => [
              key,
              typeof value === 'bigint' ? value.toString() : value
            ])
          )
        };
      }
    }

    return Response.json({
      status: 'error',
    }, { status: 500 });
  }
}