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
- @selfxyz libraries v2 for identity verification (ID documents, passports)
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

The project has zkVerifyJS integration available:
- `zkverifyjs` package installed for future zkVerify integration
- Twitter verification supports on-chain proof verification
- Ready for zkVerify implementation when needed

## Self Protocol V2 Integration

The project uses Self Protocol V2 for identity verification:

### Key Features
- Multi-document support (E-Passports, EU ID Cards)
- Enhanced disclosure configuration with granular control
- Improved backend verification with SelfBackendVerifier
- Better error handling and validation

### Usage
```typescript
// Frontend
const app = new SelfAppBuilder({
  appName: "TaskVault AI",
  scope: "trustjudge-ai",
  disclosures: {
    minimumAge: 18,
    excludedCountries: ['IRN', 'PRK'],
    ofac: true,
    name: true,
    nationality: true,
    date_of_birth: true,
  }
}).build();

// Backend
const verifier = new SelfBackendVerifier(scope, endpoint, false, [], null, "hex");
const result = await verifier.verifyProof(proof, publicSignals);
```

### Files
- `components/create/verification.tsx`: Task creation verification setup
- `components/task/taskclient.tsx`: Task verification UI
- `app/api/verify/[taskId]/route.ts`: Backend verification API
- `README-SELF-V2-MIGRATION.md`: Migration guide from v1 to v2