// Shared types and interfaces for the entire application

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WalletState {
  address: string | undefined;
  isConnected: boolean;
  chainId?: number;
}

export interface User {
  id: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  creator: string;
  prizeAmount: string;
  prizeToken: string;
  endDate: Date;
  participantCount: number;
  status: TaskStatus;
  verificationConfig?: VerificationConfig;
  createdAt: Date;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  contentHash: string;
  submittedAt: Date;
  status: SubmissionStatus;
  proof?: ProofData;
}

export interface ProofData {
  proofData: any;
  publicData: any;
  externalInputs: any;
  isLocal: boolean;
}

export interface VerificationConfig {
  scope: string;
  attestation: boolean;
  countries?: string[];
  ofac?: boolean;
  minimumAge?: number;
}

export type TaskType = 'TWITTER' | 'CONTENT_DELIVERY' | 'OMI_DEVICE' | 'CUSTOM';
export type TaskStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LoadingMode = "client" | "server" | "verifying" | null;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredOnly<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// Hook return types
export interface AsyncHookReturn<T> extends LoadingState {
  data: T | null;
  refetch: () => Promise<void>;
}

export interface MutationHookReturn<TData, TVariables = void> extends LoadingState {
  mutate: (variables: TVariables) => Promise<TData | null>;
  data: TData | null;
}

// Component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}