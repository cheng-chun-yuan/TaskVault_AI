"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useAccount } from "wagmi"

interface UserProfile {
  address: `0x${string}`
  displayName?: string
  email?: string
  avatar?: string
  bio?: string
  website?: string
  twitter?: string
  github?: string
  
  // Verification Status
  isKYCVerified: boolean
  verificationLevel: "none" | "basic" | "full"
  
  // Activity Stats
  tasksCreated: number
  tasksCompleted: number
  totalEarned: string
  reputation: number
  
  // Preferences
  emailNotifications: boolean
  browserNotifications: boolean
  defaultTaskType: string
}

interface UserActivity {
  id: string
  type: "task_created" | "task_completed" | "submission_made" | "reward_received"
  title: string
  description: string
  timestamp: Date
  amount?: string
  taskId?: string
}

interface UserContextType {
  // State
  profile: UserProfile | null
  isProfileLoading: boolean
  activities: UserActivity[]
  isActivitiesLoading: boolean
  
  // Profile Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  refreshProfile: () => Promise<void>
  
  // Activity Actions
  addActivity: (activity: Omit<UserActivity, "id" | "timestamp">) => void
  loadActivities: () => Promise<void>
  
  // Verification Actions
  initiateKYC: () => Promise<boolean>
  checkVerificationStatus: () => Promise<void>
  
  // Utility
  getDisplayName: () => string
  formatReputation: () => string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false)
  
  const { address, isConnected } = useAccount()

  // Load user profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile(address)
    } else {
      setProfile(null)
      setActivities([])
    }
  }, [isConnected, address])

  const loadUserProfile = async (userAddress: `0x${string}`) => {
    setIsProfileLoading(true)
    try {
      // First check localStorage for cached profile
      const cachedProfile = localStorage.getItem(`profile_${userAddress}`)
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile)
        const cacheTime = localStorage.getItem(`profile_${userAddress}_time`)
        
        // Use cache if less than 5 minutes old
        if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          setProfile(parsed)
          setIsProfileLoading(false)
          return
        }
      }

      // Load from API
      const response = await fetch(`/api/users/${userAddress}`)
      
      if (response.ok) {
        const { user: userData } = await response.json()
        setProfile(userData)
        localStorage.setItem(`profile_${userAddress}`, JSON.stringify(userData))
        localStorage.setItem(`profile_${userAddress}_time`, Date.now().toString())
      } else if (response.status === 404) {
        // User doesn't exist, create them
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: userAddress })
        })
        
        if (createResponse.ok) {
          const { user } = await createResponse.json()
          const newProfile: UserProfile = {
            address: userAddress,
            displayName: `User_${userAddress.slice(-4)}`,
            isKYCVerified: false,
            verificationLevel: "none",
            tasksCreated: user._count?.createdTasks || 0,
            tasksCompleted: user._count?.submissions || 0,
            totalEarned: "0",
            reputation: 0,
            emailNotifications: true,
            browserNotifications: true,
            defaultTaskType: "TELEGRAM_GROUP",
          }
          setProfile(newProfile)
          localStorage.setItem(`profile_${userAddress}`, JSON.stringify(newProfile))
          localStorage.setItem(`profile_${userAddress}_time`, Date.now().toString())
        }
      } else {
        throw new Error('Failed to load user profile')
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Fallback to basic profile
      const fallbackProfile: UserProfile = {
        address: userAddress,
        displayName: `User_${userAddress.slice(-4)}`,
        isKYCVerified: false,
        verificationLevel: "none",
        tasksCreated: 0,
        tasksCompleted: 0,
        totalEarned: "0",
        reputation: 0,
        emailNotifications: true,
        browserNotifications: true,
        defaultTaskType: "TELEGRAM_GROUP",
      }
      setProfile(fallbackProfile)
    } finally {
      setIsProfileLoading(false)
    }
  }

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!profile || !address) return false

    try {
      const response = await fetch(`/api/users/${address}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)
      localStorage.setItem(`profile_${address}`, JSON.stringify(updatedProfile))
      localStorage.setItem(`profile_${address}_time`, Date.now().toString())
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }, [profile, address])

  const refreshProfile = useCallback(async () => {
    if (address) {
      await loadUserProfile(address)
    }
  }, [address])

  const addActivity = useCallback((activity: Omit<UserActivity, "id" | "timestamp">) => {
    const newActivity: UserActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    
    setActivities(prev => [newActivity, ...prev].slice(0, 50)) // Keep last 50 activities
    
    // Cache activities
    if (address) {
      const cachedActivities = [newActivity, ...activities].slice(0, 50)
      localStorage.setItem(`activities_${address}`, JSON.stringify(cachedActivities))
    }
  }, [activities, address])

  const loadActivities = async () => {
    if (!address) return
    
    setIsActivitiesLoading(true)
    try {
      // First check localStorage
      const cachedActivities = localStorage.getItem(`activities_${address}`)
      const cacheTime = localStorage.getItem(`activities_${address}_time`)
      
      if (cachedActivities && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 5 * 60 * 1000) { // 5 minutes cache
          const parsed = JSON.parse(cachedActivities)
          const activitiesWithDates = parsed.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }))
          setActivities(activitiesWithDates)
          setIsActivitiesLoading(false)
          return
        }
      }

      // Load from API
      const response = await fetch(`/api/users/${address}/activities`)
      if (response.ok) {
        const { activities: activitiesData } = await response.json()
        const activitiesWithDates = activitiesData.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
        setActivities(activitiesWithDates)
        localStorage.setItem(`activities_${address}`, JSON.stringify(activitiesData))
        localStorage.setItem(`activities_${address}_time`, Date.now().toString())
      } else {
        // If user not found or other error, set empty activities
        setActivities([])
      }
    } catch (error) {
      console.error("Error loading activities:", error)
      setActivities([])
    } finally {
      setIsActivitiesLoading(false)
    }
  }

  const initiateKYC = async (): Promise<boolean> => {
    if (!profile) return false
    
    try {
      // TODO: Integrate with Self Protocol or other KYC provider
      // For now, just simulate KYC initiation
      console.log("Initiating KYC process...")
      return true
    } catch (error) {
      console.error("Error initiating KYC:", error)
      return false
    }
  }

  const checkVerificationStatus = async () => {
    if (!address || !profile) return
    
    try {
      // TODO: Check verification status from backend
      // const response = await fetch(`/api/users/${address}/verification`)
      // const status = await response.json()
      console.log("Checking verification status...")
    } catch (error) {
      console.error("Error checking verification status:", error)
    }
  }

  const getDisplayName = useCallback((): string => {
    if (!profile) return "Anonymous"
    return profile.displayName || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`
  }, [profile])

  const formatReputation = useCallback((): string => {
    if (!profile) return "0"
    const rep = profile.reputation
    if (rep >= 1000) return `${(rep / 1000).toFixed(1)}k`
    return rep.toString()
  }, [profile])

  const value: UserContextType = useMemo(() => ({
    profile,
    isProfileLoading,
    activities,
    isActivitiesLoading,
    updateProfile,
    refreshProfile,
    addActivity,
    loadActivities,
    initiateKYC,
    checkVerificationStatus,
    getDisplayName,
    formatReputation,
  }), [
    profile,
    isProfileLoading,
    activities,
    isActivitiesLoading,
    updateProfile,
    refreshProfile,
    addActivity,
    getDisplayName,
    formatReputation
  ])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}