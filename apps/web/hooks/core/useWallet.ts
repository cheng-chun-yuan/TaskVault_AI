import { useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";
import type { WalletState } from "@/types";

/**
 * Centralized wallet hook that provides consistent wallet state across the app
 * Reduces duplication of useWallets imports and wallet state logic
 */
export function useWallet(): WalletState {
  const { wallets } = useWallets();
  
  return useMemo(() => {
    const activeWallet = wallets[0];
    
    return {
      address: activeWallet?.address,
      isConnected: !!activeWallet?.address,
      chainId: activeWallet?.chainId ? Number(activeWallet.chainId) : undefined,
    };
  }, [wallets]);
}

/**
 * Hook to get just the wallet address (most common use case)
 */
export function useWalletAddress(): string | undefined {
  const { address } = useWallet();
  return address;
}