# 📋 Refactor Migration Guide

## 🚀 Overview

This guide helps migrate from the old structure to the new optimized architecture with better organization, reduced duplication, and improved developer experience.

## 📁 New File Structure

### Before vs After

```
// OLD STRUCTURE
hooks/
├── useTokenApproval.ts
├── useSelfVerification.ts  
├── useRegistrationStatus.ts
├── useFileUpload.ts
├── useCopyToClipboard.ts
├── useProofGeneration.ts
└── index.ts (incomplete)

// NEW STRUCTURE  
hooks/
├── core/                    # Foundation hooks
│   ├── useWallet.ts        # Centralized wallet logic
│   ├── useApi.ts           # Generic API patterns
│   └── useAsync.ts         # Async state management
├── features/               # Business logic hooks
│   ├── proof/
│   │   └── useProofGeneration.ts
│   ├── tasks/
│   │   ├── useTasks.ts
│   │   └── useTokenApproval.ts
│   └── verification/
│       └── useSelfVerification.ts
├── ui/                     # UI interaction hooks
│   ├── useFileUpload.ts
│   └── useCopyToClipboard.ts
└── index.ts               # Complete barrel exports
```

## 🔄 Import Changes

### Hook Imports

```typescript
// OLD - Multiple individual imports
import { useWallets } from "@privy-io/react-auth"
import { useTokenApproval } from '../hooks/useTokenApproval'
import { useFileUpload } from './hooks/useFileUpload'

// NEW - Clean barrel imports
import { useWalletAddress, useTokenApproval, useFileUpload } from '@/hooks'
```

### Context Changes

```typescript
// OLD - Multiple context providers
import { useUser } from '@/context/UserContext'
import { useTask } from '@/context/TaskContext'  
import { useNotification } from '@/context/NotificationContext'

// NEW - Unified state with selectors
import { useAppSelector, useNotifications } from '@/context/AppStateContext'

const { user, tasks } = useAppSelector(state => ({ 
  user: state.user, 
  tasks: state.tasks 
}))
```

## 🛠 Component Updates

### 1. Wallet Logic

```typescript
// OLD - Direct useWallets usage
import { useWallets } from "@privy-io/react-auth"

function MyComponent() {
  const { wallets } = useWallets()
  const address = wallets[0]?.address
  
  // ... component logic
}

// NEW - Centralized wallet hook
import { useWalletAddress } from '@/hooks'

function MyComponent() {
  const address = useWalletAddress()
  
  // ... component logic
}
```

### 2. Loading States

```typescript
// OLD - Manual loading state management
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleAsync = async () => {
  setIsLoading(true)
  setError(null)
  try {
    // async operation
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}

// NEW - Async hook with automatic state management
import { useAsync } from '@/hooks'

const { isLoading, error, execute } = useAsync()

const handleAsync = () => execute(async () => {
  // async operation - loading/error handled automatically
})
```

### 3. API Calls

```typescript
// OLD - Manual fetch with duplicate logic
const [loading, setLoading] = useState(false)
const submitData = async (data) => {
  setLoading(true)
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
    return result.data
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

// NEW - Standardized API hook
import { useApi } from '@/hooks'

const { isLoading, mutate } = useApi()
const submitData = (data) => mutate(data) // Handles all the boilerplate
```

## 🎯 Component Refactoring

### Twitter Upload Card Example

```typescript
// OLD - Large monolithic component
export function TwitterUploadCard({ ... }: Props) {
  const [isCopied, setIsCopied] = useState(false)
  
  // 200+ lines of mixed logic
  
  return (
    <Card>
      {/* Inline file upload JSX */}
      {/* Inline proof generation JSX */}  
      {/* Inline status display JSX */}
      {/* Inline proof actions JSX */}
    </Card>
  )
}

// NEW - Composed from smaller components
export function TwitterUploadCard({ ... }: Props) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <WalletConnectionStatus address={address} />
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <FileUploadArea fileContent={fileContent} onFileUpload={onFileUpload} />
        <ProofGenerationOptions {...proofProps} />
        <StatusDisplay isLoading={isLoading} verificationStatus={verificationStatus} />
        {proof && <ProofActions proof={proof} txHash={txHash} />}
      </CardContent>
    </Card>
  )
}
```

## 📋 Step-by-Step Migration

### Phase 1: Update Imports (Day 1)

1. **Update hook imports** to use barrel exports:
   ```bash
   # Find and replace across codebase
   find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\.\/hooks\//from "@\/hooks"/g'
   ```

2. **Update wallet usage**:
   ```typescript
   // Replace useWallets with useWalletAddress where only address is needed
   - const { wallets } = useWallets()
   - const address = wallets[0]?.address
   + const address = useWalletAddress()
   ```

### Phase 2: Refactor Components (Day 2-3)

1. **Extract common patterns**:
   - Replace loading buttons with `<LoadingButton>`
   - Replace error displays with `<ErrorMessage>`
   - Use `<LoadingSpinner>` for consistent loading states

2. **Break down large components**:
   - Extract reusable UI components
   - Separate business logic from presentation
   - Use composition over inheritance

### Phase 3: Context Migration (Day 4)

1. **Gradually migrate to unified context**:
   ```typescript
   // Replace individual context usage
   - const { user } = useUser()
   - const { tasks } = useTask()
   + const { user, tasks } = useAppSelector(state => ({ 
   +   user: state.user, 
   +   tasks: state.tasks 
   + }))
   ```

### Phase 4: Testing & Cleanup (Day 5)

1. **Test all functionality**
2. **Remove old context providers**  
3. **Clean up unused imports**
4. **Update documentation**

## ⚠️ Breaking Changes & Gotchas

### 1. Import Path Changes
- All hook imports now come from `@/hooks`
- Type imports available from `@/types`
- Context imports changed to unified provider

### 2. Hook Interface Changes
- `useProofGeneration` no longer takes `address` (uses `useWalletAddress` internally)
- Loading states now use typed `LoadingMode` instead of strings

### 3. Context API Changes
- Multiple providers replaced with single `AppStateProvider`
- State access through selectors prevents unnecessary re-renders

## 🧪 Testing Strategy

### Before Migration
```bash
# Run full test suite
npm test

# Take screenshot tests  
npm run test:visual

# Check TypeScript
npm run typecheck
```

### After Each Phase
```bash
# Verify no regressions
npm test

# Check bundle size impact
npm run analyze

# Verify performance
npm run lighthouse
```

## 🎯 Success Validation

### Metrics to Track
- [ ] **Bundle size reduction**: Target 20% reduction
- [ ] **Type coverage**: Maintain 95%+ TypeScript coverage  
- [ ] **Component reusability**: 50% more reusable components
- [ ] **Code duplication**: 70% reduction in duplicate patterns
- [ ] **Performance**: No regression in Lighthouse scores

### Functionality Checklist
- [ ] All existing features work identically
- [ ] Wallet connection flows unchanged
- [ ] Proof generation works on both client/server
- [ ] Copy/paste functionality preserved
- [ ] zkVerify integration intact
- [ ] Error handling improved
- [ ] Loading states more consistent

## 🆘 Rollback Plan

If issues arise:

1. **Immediate rollback**:
   ```bash
   git revert <migration-commit-hash>
   ```

2. **Gradual rollback**:
   - Revert to old import paths
   - Restore original context providers
   - Keep new common components (they're additive)

3. **Identify and fix**:
   - Check console for import errors
   - Verify hook interface changes
   - Test critical user flows

## 📞 Support

For migration issues:
- Check this guide first
- Review the REFACTOR_PLAN.md for context
- Test in isolation using the development branch
- Create detailed issue reports with before/after code examples