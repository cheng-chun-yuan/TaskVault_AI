# Reclaim Protocol Integration

This page implements Reclaim Protocol verification for HiveMind, allowing users to verify their data privately using zero-knowledge proofs.

## Setup

### 1. Get Reclaim Protocol Credentials

Visit [Reclaim Protocol Dashboard](https://dev.reclaimprotocol.org/) to:
- Create an application
- Get your `APPLICATION_ID` and `APPLICATION_SECRET`
- Configure your provider and get `PROVIDER_ID`

### 2. Configure Environment Variables

Add to your `.env` file:

```env
RECLAIM_APPLICATION_ID=your_application_id_here
RECLAIM_APPLICATION_SECRET=your_application_secret_here
RECLAIM_PROVIDER_ID=your_provider_id_here
```

### 3. Test the Integration

```bash
# Start the development server
bun dev

# Navigate to http://localhost:3000/reclaim
```

## How It Works

### Architecture

```
User → /reclaim page
  ↓
ReclaimPageContent (dynamic import)
  ↓
useReclaimVerification hook
  ↓
/api/reclaim/generate-config
  ↓
ReclaimProofRequest.init()
  ↓
triggerReclaimFlow() → Auto-detects user environment:
  - Desktop: Browser extension or QR code popup
  - Mobile: App clip or Instant App
  ↓
startSession() → Proof generation
  ↓
Display proofs to user
```

### Verification Flow

1. **Connect Wallet**: User must connect their wallet first
2. **Start Verification**: Click the "Start Verification" button
3. **Config Generation**: Backend creates a Reclaim proof request config
4. **Trigger Flow**: Frontend initializes and triggers the verification flow
5. **Complete Verification**: User completes verification in their preferred method
6. **Receive Proofs**: Cryptographic proofs are returned and displayed

### Components

- **ReclaimVerificationHeader**: Page title and description
- **ReclaimProgressCard**: Shows current progress with 4 steps
- **ReclaimInstructionsCard**: Explains the process to users
- **ReclaimVerificationCard**: Main action card with verification button
- **ReclaimProofDisplay**: Shows received proofs with details

### Hook: `useReclaimVerification`

Custom hook managing the entire verification flow:

```typescript
const {
  proofs,           // Received proofs (null | any[])
  isLoading,        // Loading state (boolean)
  verificationStatus, // 'idle' | 'loading' | 'verifying' | 'success' | 'error'
  error,            // Error message (string | null)
  startVerification // Function to start the flow
} = useReclaimVerification();
```

## Customization

### Change Provider

Update the `RECLAIM_PROVIDER_ID` environment variable to use different data sources (e.g., Twitter, GitHub, LinkedIn, etc.)

### Customize UI

All components are in `components/reclaim/` and can be customized:
- Update colors/styling with Tailwind classes
- Modify instructions in `ReclaimInstructionsCard`
- Change progress steps in `ReclaimProgressCard`

### Handle Proofs

Modify `ReclaimProofDisplay` to add custom proof handling:
- Store proofs in database
- Submit to smart contracts
- Verify against task requirements

## Troubleshooting

### "Missing Reclaim Protocol configuration" Error

Ensure all three environment variables are set correctly in `.env`

### Verification Flow Doesn't Start

Check browser console for errors. Common issues:
- Wallet not connected
- Network connectivity
- Invalid provider ID

### Proofs Not Displaying

Check the `onSuccess` callback in `useReclaimVerification.ts` - the proof format may vary by provider.

## Resources

- [Reclaim Protocol Docs](https://docs.reclaimprotocol.org/)
- [Frontend Integration Guide](https://docs.reclaimprotocol.org/web/frontend/fullstack)
- [SDK Reference](https://docs.reclaimprotocol.org/js-sdk)
