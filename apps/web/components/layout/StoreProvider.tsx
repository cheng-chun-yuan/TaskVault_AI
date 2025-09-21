"use client"

import { useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useUserStore } from "@/stores/userStore"
import { useTaskStore } from "@/stores/taskStore"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const loadUserProfile = useUserStore(state => state.loadUserProfile)
  const setProfile = useUserStore(state => state.setProfile)
  const loadTasks = useTaskStore(state => state.loadTasks)

  // Initialize user profile when user authenticates with Privy
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      // Get the first wallet address (primary wallet)
      const primaryWallet = wallets[0]
      if (primaryWallet?.address) {
        loadUserProfile(primaryWallet.address as `0x${string}`)
      }
    } else if (ready && !authenticated) {
      setProfile(null)
    }
  }, [ready, authenticated, wallets, loadUserProfile, setProfile])

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return <>{children}</>
}