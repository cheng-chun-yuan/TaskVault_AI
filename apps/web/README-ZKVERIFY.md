# zkVerify Integration with zk-email

This document explains how to integrate zkVerify with your existing zk-email implementation for decentralized proof verification.

## Overview

zkVerify provides a decentralized infrastructure for verifying zero-knowledge proofs. Instead of verifying proofs directly on-chain (which can be expensive), zkVerify batches and verifies proofs on its specialized network, then submits aggregated proofs to the main blockchain.

## Setup Instructions

### 1. Install Dependencies

The zkVerify integration has been installed:

```bash
bun add zkverifyjs
```

### 2. Environment Configuration

Add your zkVerify credentials to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE="your-seed-phrase-for-volta-network"
```

**Important**: For production, use proper key management instead of environment variables.

### 3. Get Volta Network Credentials

1. Visit [zkVerify Documentation](https://docs.zkverify.io/) to set up an account
2. Generate a seed phrase for the Volta testnet
3. Fund your account with test tokens if required

## Integration Features

### Current Implementation

The Twitter verification page now supports:

- **zkVerify Integration**: Toggle between zkVerify and traditional on-chain verification
- **Real-time Status Updates**: Shows verification progress and results
- **Error Handling**: Comprehensive error messages for debugging
- **Transaction Tracking**: Displays transaction hashes and block numbers

### Code Structure

```
apps/web/
├── lib/zkverify.ts              # zkVerify integration utilities
├── app/twitter/page.tsx         # Updated Twitter verification with zkVerify
└── app/twitter-zkverify/page.tsx # Standalone zkVerify example
```

### Key Components

1. **ZkVerifyIntegration Class** (`lib/zkverify.ts`):
   - Handles proof submission to zkVerify
   - Manages network configuration (Volta/Mainnet)
   - Provides status tracking and error handling

2. **Updated Twitter Page** (`app/twitter/page.tsx`):
   - Includes verification method toggle
   - Real-time zkVerify status updates
   - Backwards compatible with original implementation

## Usage Example

```typescript
import { createZkVerifyIntegration } from '@/lib/zkverify';

// Create zkVerify integration
const zkVerifyIntegration = createZkVerifyIntegration('Volta');

// Verify a zk-email proof
const result = await zkVerifyIntegration.verifyProof(
  proof, 
  vkey, 
  (status) => {
    console.log('Verification status:', status);
  }
);

console.log('Final result:', result);
```

## Verification Flow

1. **Generate zk-email proof** using existing `@zk-email/sdk`
2. **Extract verification key** from the blueprint
3. **Submit to zkVerify** using the zkVerify SDK
4. **Monitor progress** through event listeners
5. **Receive confirmation** with transaction details

## Network Configuration

### Volta Testnet (Default)
- Fast verification
- Test tokens required
- Good for development

### Mainnet
- Production environment
- Real tokens required
- Higher security guarantees

## Error Handling

The integration includes comprehensive error handling for:

- Missing environment variables
- Network connectivity issues
- Invalid proofs
- Timeout scenarios
- zkVerify service errors

## Benefits of zkVerify Integration

1. **Cost Efficiency**: Batch verification reduces gas costs
2. **Scalability**: Handle high-volume proof verification
3. **Decentralization**: Avoid centralized verification services
4. **Transparency**: All verifications recorded on-chain
5. **Reliability**: Redundant verification infrastructure

## Migration Guide

To migrate existing zk-email proofs to zkVerify:

1. **Keep existing code**: The integration is backwards compatible
2. **Add zkVerify toggle**: Users can choose verification method
3. **Test thoroughly**: Verify both paths work correctly
4. **Monitor performance**: Compare verification times and costs

## Troubleshooting

### Common Issues

1. **"zkVerify seed phrase not configured"**
   - Solution: Set `NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE` environment variable

2. **"Verification timeout"**
   - Solution: Check network connection and zkVerify service status

3. **"Invalid proof format"**
   - Solution: Ensure proof is generated with compatible zk-email SDK version

### Debug Mode

Enable verbose logging by setting:
```bash
DEBUG=zkverify:*
```

## Security Considerations

1. **Seed Phrase Management**: Use secure key management in production
2. **Network Selection**: Choose appropriate network for your use case
3. **Proof Validation**: Always validate proofs before submission
4. **Rate Limiting**: Implement appropriate rate limiting for API calls

## Support

- [zkVerify Documentation](https://docs.zkverify.io/)
- [zkVerify GitHub](https://github.com/zkverify)
- [zk-email Documentation](https://prove.email/)