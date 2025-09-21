"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount, useChainId } from "wagmi"

interface AppState {
  // UI State
  isDarkMode: boolean
  sidebarOpen: boolean
  currentPage: string
  
  // Loading States
  isLoading: boolean
  loadingMessage: string
  
  // Network State
  chainId: number | undefined
  isConnected: boolean
  address: `0x${string}` | undefined
  
  // App Settings
  preferredCurrency: "ETH" | "USD"
  notificationsEnabled: boolean
}

interface AppContextType {
  state: AppState
  
  // UI Actions
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
  
  // Loading Actions
  setLoading: (loading: boolean, message?: string) => void
  
  // Settings Actions
  setPreferredCurrency: (currency: "ETH" | "USD") => void
  toggleNotifications: () => void
  
  // Utility
  formatCurrency: (amount: string, decimals?: number) => string
}

const defaultState: AppState = {
  isDarkMode: false,
  sidebarOpen: false,
  currentPage: "/",
  isLoading: false,
  loadingMessage: "",
  chainId: undefined,
  isConnected: false,
  address: undefined,
  preferredCurrency: "ETH",
  notificationsEnabled: true,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  // Sync wallet state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      address,
      isConnected,
      chainId,
    }))
  }, [address, isConnected, chainId])

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("taskVault_preferences")
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        setState(prev => ({
          ...prev,
          isDarkMode: preferences.isDarkMode ?? false,
          preferredCurrency: preferences.preferredCurrency ?? "ETH",
          notificationsEnabled: preferences.notificationsEnabled ?? true,
        }))
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    const preferences = {
      isDarkMode: state.isDarkMode,
      preferredCurrency: state.preferredCurrency,
      notificationsEnabled: state.notificationsEnabled,
    }
    localStorage.setItem("taskVault_preferences", JSON.stringify(preferences))
  }, [state.isDarkMode, state.preferredCurrency, state.notificationsEnabled])

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))
  }

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }

  const setCurrentPage = (page: string) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  const setLoading = (loading: boolean, message = "") => {
    setState(prev => ({ ...prev, isLoading: loading, loadingMessage: message }))
  }

  const setPreferredCurrency = (currency: "ETH" | "USD") => {
    setState(prev => ({ ...prev, preferredCurrency: currency }))
  }

  const toggleNotifications = () => {
    setState(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))
  }

  const formatCurrency = (amount: string, decimals = 4) => {
    if (state.preferredCurrency === "ETH") {
      return `${parseFloat(amount).toFixed(decimals)} ETH`
    }
    // TODO: Add USD conversion logic
    return `$${(parseFloat(amount) * 2000).toFixed(2)}` // Mock ETH to USD conversion
  }

  const value: AppContextType = {
    state,
    toggleDarkMode,
    toggleSidebar,
    setCurrentPage,
    setLoading,
    setPreferredCurrency,
    toggleNotifications,
    formatCurrency,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}