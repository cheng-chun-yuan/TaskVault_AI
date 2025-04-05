import { NextRequest } from 'next/server';
import { getUserIdentifier } from '@selfxyz/core';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SubmissionRegistryAbi } from '@/content/abi';
import { celoAlfajores } from 'viem/chains';
import { SubmissionRegistry } from '@/content/address';
import { prisma } from '@/lib/prisma';

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
    // Get user address from public signals
    const address = await getUserIdentifier(publicSignals, "hex");
    console.log(`Processing verification for task ${taskId} from address ${address}`);

    // Contract setup
    const contractAddress = SubmissionRegistry;
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    console.log(account)

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
      address: contractAddress,
      abi: SubmissionRegistryAbi,
      functionName: 'verifySelfProof',
      args: [proofData, taskId]
    });

    console.log(`Verification submitted for task ${taskId} with hash: ${hash}`);

    // Wait for the transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Save proof to database
    const savedProof = await prisma.proof.create({
      data: {
        taskId,
        walletAddress: address,
        proofData: proof,
        publicData: publicSignals,
        externalInputs: {},
        isLocal: false,
      },
    });

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