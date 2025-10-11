import { useState, useCallback } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export type VerificationStatus = 'idle' | 'loading' | 'verifying' | 'success' | 'error';

export function useReclaimVerification() {
  const [proofs, setProofs] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const startVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      setVerificationStatus('loading');
      setError(null);

      // Fetch configuration from backend
      const response = await fetch('/api/reclaim/generate-config');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Reclaim configuration');
      }

      const { reclaimProofRequestConfig } = await response.json();

      // Initialize ReclaimProofRequest from config
      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);

      setVerificationStatus('verifying');

      // Trigger the Reclaim flow (auto-detects user environment)
      await reclaimProofRequest.triggerReclaimFlow();

      // Start verification session
      await reclaimProofRequest.startSession({
        onSuccess: (receivedProofs: any) => {
          console.log('Verification successful', receivedProofs);
          const proofsArray = Array.isArray(receivedProofs) ? receivedProofs : [receivedProofs];
          setProofs(proofsArray);
          setVerificationStatus('success');
          setIsLoading(false);
        },
        onError: (err: any) => {
          console.error('Verification failed', err);
          setError(err?.message || 'Verification failed');
          setVerificationStatus('error');
          setIsLoading(false);
        }
      });

    } catch (err) {
      console.error('Error starting verification:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setVerificationStatus('error');
      setIsLoading(false);
    }
  }, []);

  return {
    proofs,
    isLoading,
    verificationStatus,
    error,
    startVerification
  };
}
