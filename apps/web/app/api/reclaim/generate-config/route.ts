import { NextResponse } from 'next/server';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export async function GET() {
  try {
    const applicationId = process.env.RECLAIM_APPLICATION_ID;
    const applicationSecret = process.env.RECLAIM_APPLICATION_SECRET;
    const providerId = process.env.RECLAIM_PROVIDER_ID;

    if (!applicationId || !applicationSecret || !providerId) {
      return NextResponse.json(
        { error: 'Missing Reclaim Protocol configuration. Please set RECLAIM_APPLICATION_ID, RECLAIM_APPLICATION_SECRET, and RECLAIM_PROVIDER_ID environment variables.' },
        { status: 500 }
      );
    }

    // Create a new Reclaim proof request
    const reclaimProofRequest = await ReclaimProofRequest.init(
      applicationId,
      applicationSecret,
      providerId
    );

    // Convert to JSON string for frontend
    const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();

    return NextResponse.json({
      reclaimProofRequestConfig,
      success: true
    });
  } catch (error) {
    console.error('Error generating Reclaim config:', error);
    return NextResponse.json(
      { error: 'Failed to generate Reclaim configuration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
