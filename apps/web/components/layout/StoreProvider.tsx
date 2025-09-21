"use client"

import { useEffect } from "react"
import { useAccount } from "wagmi"
import { useUserStore } from "@/stores/userStore"
import { useTaskStore } from "@/stores/taskStore"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const loadUserProfile = useUserStore(state => state.loadUserProfile)
  const setProfile = useUserStore(state => state.setProfile)
  const loadTasks = useTaskStore(state => state.loadTasks)

  // Initialize user profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile(address)
    } else {
      setProfile(null)
    }
  }, [isConnected, address, loadUserProfile, setProfile])

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return <>{children}</>
}