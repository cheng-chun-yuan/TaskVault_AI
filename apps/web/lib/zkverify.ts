import { zkVerifySession, Library, CurveType } from 'zkverifyjs';
import { Proof } from '@zk-email/sdk';

export interface ZkVerifyConfig {
  network: 'Volta' | 'Mainnet';
  seedPhrase: string;
}

export interface ZkVerifyProofData {
  vk: any;
  proof: any;
  publicSignals: any[];
}

export interface ZkVerifyResult {
  transactionHash?: string;
  blockHash?: string;
  blockNumber?: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export class ZkVerifyIntegration {
  private config: ZkVerifyConfig;

  constructor(config: ZkVerifyConfig) {
    this.config = config;
  }

  /**
   * Extract proof data from zk-email SDK proof format to zkVerify format
   */
  private extractProofData(proof: Proof, vkey: any): ZkVerifyProofData {
    return {
      vk: vkey,
      proof: proof.props.proofData.proof,
      publicSignals: proof.props.proofData.publicInputs
    };
  }

  /**
   * Verify a zk-email proof using zkVerify
   */
  async verifyProof(
    proof: Proof, 
    vkey: any,
    onStatusUpdate?: (result: ZkVerifyResult) => void
  ): Promise<ZkVerifyResult> {
    try {
      // Extract proof data in zkVerify format
      const proofData = this.extractProofData(proof, vkey);
      
      console.log('Submitting proof to zkVerify...', {
        network: this.config.network,
        proofSize: JSON.stringify(proofData.proof).length,
        publicSignalsCount: proofData.publicSignals.length
      });

      // Initialize zkVerify session
      const sessionBuilder = zkVerifySession.start();
      
      // Configure network
      const session = this.config.network === 'Volta' 
        ? await sessionBuilder.Volta().withAccount(this.config.seedPhrase)
        : await sessionBuilder.Mainnet().withAccount(this.config.seedPhrase);

      // Submit proof for verification
      const result = await session
        .verify()
        .groth16({
          library: Library.snarkjs,
          curve: CurveType.bn128
        })
        .execute({ proofData });

      // Create result object
      let zkVerifyResult: ZkVerifyResult = { status: 'pending' };

      // Set up event listeners
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('zkVerify verification timeout'));
        }, 300000); // 5 minute timeout

        result.on('includedInBlock', (data: any) => {
          clearTimeout(timeout);
          zkVerifyResult = {
            status: 'success',
            transactionHash: data.transactionHash,
            blockHash: data.blockHash,
            blockNumber: data.blockNumber
          };
          
          if (onStatusUpdate) onStatusUpdate(zkVerifyResult);
          resolve(zkVerifyResult);
        });

        result.on('error', (error: any) => {
          clearTimeout(timeout);
          zkVerifyResult = {
            status: 'failed',
            error: error.message || 'Unknown verification error'
          };
          
          if (onStatusUpdate) onStatusUpdate(zkVerifyResult);
          reject(error);
        });

        // Immediate callback for pending status
        if (onStatusUpdate) onStatusUpdate(zkVerifyResult);
      });

    } catch (error) {
      const failedResult: ZkVerifyResult = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      if (onStatusUpdate) onStatusUpdate(failedResult);
      throw error;
    }
  }

  /**
   * Batch verify multiple proofs
   */
  async verifyBatchProofs(
    proofs: Array<{ proof: Proof; vkey: any }>,
    onBatchStatusUpdate?: (results: ZkVerifyResult[]) => void
  ): Promise<ZkVerifyResult[]> {
    const results: ZkVerifyResult[] = [];
    
    for (let i = 0; i < proofs.length; i++) {
      const { proof, vkey } = proofs[i];
      
      try {
        const result = await this.verifyProof(proof, vkey, (status) => {
          results[i] = status;
          if (onBatchStatusUpdate) onBatchStatusUpdate([...results]);
        });
        
        results[i] = result;
      } catch (error) {
        results[i] = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }

  /**
   * Get verification status from transaction hash
   */
  async getVerificationStatus(transactionHash: string): Promise<ZkVerifyResult> {
    // This would require additional zkVerify API calls to check status
    // Implementation depends on zkVerify SDK capabilities
    throw new Error('Status checking not implemented - check zkVerify documentation');
  }
}

// Utility function to create zkVerify integration with environment config
export function createZkVerifyIntegration(
  network: 'Volta' | 'Mainnet' = 'Volta'
): ZkVerifyIntegration {
  const seedPhrase = process.env.NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE;
  
  if (!seedPhrase) {
    throw new Error(
      'NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE environment variable is required'
    );
  }

  return new ZkVerifyIntegration({
    network,
    seedPhrase
  });
}

// Type definitions for better TypeScript support
export type { ZkVerifyConfig, ZkVerifyProofData, ZkVerifyResult };