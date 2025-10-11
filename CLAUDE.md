# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**HiveMind** is a Turborepo monorepo that bridges Web2 social engagement with Web3 automation through privacy-preserving identity verification, AI-powered content evaluation, and blockchain-based reward distribution.

### Workspace Structure

- **apps/web**: Next.js 15 frontend with Prisma database integration
- **apps/contract**: Hardhat smart contract development environment
- **packages/ui**: Shared UI components using shadcn/ui
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configuration

### Core System Components

**Smart Contracts** (`apps/contract/contracts/`):
- `taskVaultCore.sol`: Main contract managing task creation, style commits/reveals, and verification config initialization
- `prizeVault.sol`: Handles prize deposits and distribution with rate limiting (maxPerTime, maxPerDay)
- `submissionRegistry.sol`: Manages task submissions with Self Protocol verification configs
- `ERC20Mock.sol`: Mock ERC20 token for testing

**Frontend Architecture** (`apps/web/`):
- Database: PostgreSQL with Prisma ORM
- Authentication: Privy wallet integration with Wagmi for Sepolia and Celo Alfajores networks
- Task types: TWITTER_INTERACT, CONTENT_DELIVERY, TELEGRAM_GROUP (see TaskType enum in schema)
- Multi-step task creation flow with verification configs and progress tracking
- Reward timing: INSTANT or POST_EVENT distribution

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
# Deploy to different networks (uses npx hardhat internally)
bun deploy:hardhat    # Local Hardhat network (chainId 1337)
bun deploy:sepolia    # Sepolia testnet via Alchemy
bun deploy:celo       # Celo Alfajores testnet via Alchemy

# Interact with deployed contracts
bun interact:hardhat
bun interact:sepolia
bun interact:celo
```

## Key Technical Details

### Database Schema
The Prisma schema (`apps/web/prisma/schema.prisma`) defines:
- **Users**: Identified by unique wallet address, optional Telegram handle, role (USER/ADMIN)
- **Tasks**: Include taskType enum, verification configs, prize details (tokenAddress, amount), styleCommit, deadline, max participants, rate limits (maxPerTime, maxPerDay), rewardTiming, Telegram chat ID and submission tags
- **Submissions**: Link users to tasks with contentHash, status enum (PENDING/APPROVED/REJECTED/REWARDED), AI judge score/reason, reward transaction hash
- **TaskParticipation**: Simple join tracking for tasks (unique constraint on taskId + userId)

### Smart Contract Flow
1. Task creation requires approved prize tokens (or native ETH) and deposits to PrizeVault with rate limits
2. Style commits use keccak256(abi.encodePacked(style, salt)) commitment scheme for reveal later
3. Verification configs (scope, attestationId, age restrictions, forbidden countries, OFAC flags) are set in SubmissionRegistry during task creation via `initTaskVerificationConfig`
4. Judge role (single address) can reveal styles and mark tasks as judged
5. Refunds available for unjudged tasks via `refund()` function

### Frontend Integration
- **Web3**: viem/wagmi for contract interactions, Privy for wallet auth (Sepolia & Celo Alfajores networks configured)
- **Twitter Verification**: @zk-email/sdk for email-based Twitter account verification
- **zkVerify**: zkverifyjs package for decentralized proof verification on Volta network (`NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE` env var)
- **Identity Verification**: @selfxyz/core v2 and @selfxyz/qrcode for Self Protocol integration (E-Passports, EU ID Cards)
- **UI**: Multi-step task creation flow with progress indicators, component library in packages/ui
- **State**: Zustand for client state, React Query for server state
- **Styling**: Tailwind CSS with next-themes for dark mode

## Environment Setup

**Contracts** (`apps/contract/.env`):
- `PRIVATE_KEY`: Deployer wallet private key
- `ALCHEMY_API_KEY`: For Sepolia and Celo Alfajores RPC endpoints
- `ETHERSCAN_API_KEY`: For Sepolia contract verification
- `CELOSCAN_API_KEY`: For Celo Alfajores contract verification

**Web Application** (`apps/web/.env`):
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_ZKVERIFY_SEED_PHRASE`: Seed phrase for zkVerify Volta network proof verification
- Privy configuration variables (see Privy docs)
- Additional integration-specific environment variables

## Key Integration Patterns

### Self Protocol V2 Identity Verification
Uses @selfxyz/core v2 for privacy-preserving identity checks:

**Frontend** (`components/create/verification.tsx`, `components/task/taskclient.tsx`):
```typescript
const app = new SelfAppBuilder({
  appName: "HiveMind",
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
```

**Backend** (`app/api/verify/[taskId]/route.ts`):
```typescript
const verifier = new SelfBackendVerifier(scope, endpoint, false, [], null, "hex");
const result = await verifier.verifyProof(proof, publicSignals);
```

**Key Files**:
- Smart contracts also use @selfxyz/contracts for on-chain verification registry
- See `README-SELF-V2-MIGRATION.md` for migration guide from v1

### zkVerify & Twitter Verification
- Twitter verification uses @zk-email/sdk to prove Twitter account ownership via password reset emails
- Proofs can be verified on-chain using zkverifyjs on Volta network
- API routes: `app/api/zkverify/submit/route.ts` for proof submission

### API Routes Structure
- `/api/tasks`: Task CRUD operations
- `/api/tasks/[id]/join`: Join task endpoint
- `/api/verify/[taskId]`: Self Protocol verification endpoint
- `/api/submissions`: Submission management
- `/api/telegram/submit`: Telegram submission handling
- `/api/users/[address]`: User profile and activities

## Deployed Contracts

Production contracts are deployed on Celo Alfajores and Sepolia:
- **HiveMindCore**: `0x8441c3b1e6747605ab04e8a64f309bfba1fd37fe`
- **SubmissionRegistry**: `0x0ff023acedbf133b998c70dd73d7b54db926cd44`
- **PrizeVault**: `0xaf9048dca78acb1e4ea4a51af7b9e496a10c9e25`
- **ERC20Mock**: `0xa5839608ff9511b66ab177530bd508727ca3455a`

## Development Notes

### Bundle Analysis
Run `bun build:analyze` in `apps/web` to analyze Next.js bundle size using @next/bundle-analyzer

### Hardhat Configuration
- Solidity 0.8.28 with optimizer enabled (200 runs) and viaIR compiler flag
- Networks: hardhat (chainId 1337), sepolia, celo (Alfajores)
- Uses Hardhat Ignition for deployments and Hardhat Viem for type-safe contract interactions

### Turborepo Cache
Build outputs are cached in `.next/**` (excluding `.next/cache/**`)
Environment variables like `ZKVERIFY_SEED_PHRASE` are included in cache keys