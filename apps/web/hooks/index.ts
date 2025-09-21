// Core hooks - foundational functionality
export { useWallet, useWalletAddress } from './core/useWallet'
export { useApi, useApiQuery } from './core/useApi'
export { useAsync, useLoading } from './core/useAsync'

// UI hooks - user interface functionality
export { useCopyToClipboard } from './ui/useCopyToClipboard'
export { useFileUpload } from './ui/useFileUpload'

// Feature hooks - business logic
export { useProofGeneration } from './features/proof/useProofGeneration'
export { useTasks } from './features/tasks/useTasks'
export { useTokenApproval } from './features/tasks/useTokenApproval'
export { useSelfVerification } from './features/verification/useSelfVerification'

// Legacy exports (to be removed after migration)
export { useRegistrationStatus } from './useRegistrationStatus'

// Type exports for external use
export type { LoadingMode } from '@/types'