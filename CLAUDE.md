# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**TaskVault AI** is a monorepo with three main applications:

- **apps/web**: Next.js 15 frontend with Prisma database integration
- **apps/contract**: Hardhat smart contract development environment
- **packages/ui**: Shared UI components using shadcn/ui
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configuration

### Core System Components

**Smart Contracts** (`apps/contract/contracts/`):
- `taskVaultCore.sol`: Main contract managing task creation, style commits/reveals, and verification
- `prizeVault.sol`: Handles prize distribution and refunds
- `submissionRegistry.sol`: Manages task submissions with verification configs

**Frontend Architecture** (`apps/web/`):
- Database: PostgreSQL with Prisma ORM
- Authentication: Privy wallet integration with Wagmi
- Task types: Twitter interactions, content delivery, OMI AI device tasks
- Multi-step task creation flow with verification configs

## Development Commands

### Root Level (Turborepo)
```bash
# Install dependencies
bun install

# Run all apps in development
bun dev

# Build all apps
bun build

# Lint all apps
bun lint

# Format code
bun format
```

### Web Application (`apps/web`)
```bash
# Development server with Turbopack
bun dev

# Build production
bun build

# Database operations
bun generate        # Generate Prisma client
bun migrate:dev     # Apply migrations in development
bun migrate:deploy  # Apply migrations in production
bun db:push         # Push schema changes
bun db:studio       # Launch Prisma Studio

# Type checking
bun typecheck

# Linting
bun lint
bun lint:fix
```

### Smart Contracts (`apps/contract`)
```bash
# Deploy to different networks
bun deploy:hardhat
bun deploy:sepolia
bun deploy:celo

# Interact with deployed contracts
bun interact:hardhat
bun interact:sepolia
bun interact:celo
```

## Key Technical Details

### Database Schema
- **Users**: Identified by wallet address, track created tasks and submissions
- **Tasks**: Include verification configs (scope, attestation, country restrictions, OFAC), prize details, and style commits
- **Submissions**: Link users to tasks with content hashes

### Smart Contract Flow
1. Task creation requires approved prize tokens and deposits to PrizeVault
2. Style commits use hash commitment scheme for reveal later
3. Verification configs are set in SubmissionRegistry during task creation
4. Judge role can reveal styles and mark tasks as judged
5. Refunds available for unjudged tasks

### Frontend Integration
- Uses viem/wagmi for web3 interactions
- @zk-email/sdk for email verification with Twitter blueprint
- zkVerify integration for decentralized proof verification on Volta network
- @selfxyz libraries for additional verification features
- Multi-step task creation with progress tracking
- Support for native ETH and ERC20 token prizes

## Environment Setup

Contracts require these environment variables:
- `PRIVATE_KEY`: Deployer private key
- `ALCHEMY_API_KEY`: Alchemy RPC endpoint
- `ETHERSCAN_API_KEY`: For contract verification
- `CELOSCAN_API_KEY`: For Celo contract verification

Web app requires:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE`: Seed phrase for zkVerify Volta network verification
- Additional environment variables for Privy and other integrations

## zkVerify Integration

The project integrates zkVerify for decentralized ZK proof verification:

### Key Features
- Toggle between zkVerify and traditional on-chain verification
- Real-time verification status updates
- Support for Volta testnet and Mainnet
- Comprehensive error handling and logging

### Usage
```typescript
import { createZkVerifyIntegration } from '@/lib/zkverify';
const zkVerifyIntegration = createZkVerifyIntegration('Volta');
await zkVerifyIntegration.verifyProof(proof, vkey, onStatusUpdate);
```

### Files
- `lib/zkverify.ts`: Core integration utilities
- `app/twitter/page.tsx`: Twitter verification with zkVerify option
- `README-ZKVERIFY.md`: Detailed setup and usage guide