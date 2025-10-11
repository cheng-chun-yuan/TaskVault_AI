"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

interface UserStore {
  // State
  profile: UserProfile | null
  isProfileLoading: boolean
  activities: UserActivity[]
  isActivitiesLoading: boolean
  
  // Actions
  setProfile: (profile: UserProfile | null) => void
  setProfileLoading: (loading: boolean) => void
  setActivities: (activities: UserActivity[]) => void
  setActivitiesLoading: (loading: boolean) => void
  addActivity: (activity: Omit<UserActivity, "id" | "timestamp">) => void
  
  // API Actions
  loadUserProfile: (address: `0x${string}`) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  refreshProfile: () => Promise<void>
  loadActivities: () => Promise<void>
  
  // Utility functions
  getDisplayName: () => string
  formatReputation: () => string
  
  // Verification Actions
  initiateKYC: () => Promise<boolean>
  checkVerificationStatus: () => Promise<void>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isProfileLoading: false,
      activities: [],
      isActivitiesLoading: false,

      // Actions
      setProfile: (profile) => set({ profile }),
      setProfileLoading: (loading) => set({ isProfileLoading: loading }),
      setActivities: (activities) => set({ activities }),
      setActivitiesLoading: (loading) => set({ isActivitiesLoading: loading }),
      
      addActivity: (activity) => {
        const newActivity: UserActivity = {
          ...activity,
          id: Date.now().toString(),
          timestamp: new Date(),
        }
        
        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 50) // Keep last 50 activities
        }))
        
        // Cache activities
        const { profile } = get()
        if (profile?.address) {
          const cachedActivities = [newActivity, ...get().activities].slice(0, 50)
          localStorage.setItem(`activities_${profile.address}`, JSON.stringify(cachedActivities))
        }
      },

      // API Actions
      loadUserProfile: async (userAddress: `0x${string}`) => {
        set({ isProfileLoading: true })
        try {
          // First check localStorage for cached profile
          const cachedProfile = localStorage.getItem(`profile_${userAddress}`)
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile)
            const cacheTime = localStorage.getItem(`profile_${userAddress}_time`)
            
            // Use cache if less than 5 minutes old
            if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
              set({ profile: parsed, isProfileLoading: false })
              return
            }
          }

          // Load from API
          const response = await fetch(`/api/users/${userAddress}`)
          
          if (response.ok) {
            const { user: userData } = await response.json()
            set({ profile: userData })
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
              set({ profile: newProfile })
              localStorage.setItem(`profile_${userAddress}`, JSON.stringify(newProfile))
              localStorage.setItem(`profile_${userAddress}_time`, Date.now().toString())
            }
          } else {
            console.error("Error loading user profile:", response.statusText)
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
          set({ profile: fallbackProfile })
        } finally {
          set({ isProfileLoading: false })
        }
      },

      updateProfile: async (updates: Partial<UserProfile>): Promise<boolean> => {
        const { profile } = get()
        if (!profile) return false

        try {
          const response = await fetch(`/api/users/${profile.address}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })
          
          if (!response.ok) {
            throw new Error('Failed to update profile')
          }
          
          const updatedProfile = { ...profile, ...updates }
          set({ profile: updatedProfile })
          localStorage.setItem(`profile_${profile.address}`, JSON.stringify(updatedProfile))
          localStorage.setItem(`profile_${profile.address}_time`, Date.now().toString())
          return true
        } catch (error) {
          console.error("Error updating profile:", error)
          return false
        }
      },

      refreshProfile: async () => {
        const { profile } = get()
        if (profile?.address) {
          await get().loadUserProfile(profile.address)
        }
      },

      loadActivities: async () => {
        const { profile } = get()
        if (!profile?.address) return
        
        set({ isActivitiesLoading: true })
        try {
          // First check localStorage
          const cachedActivities = localStorage.getItem(`activities_${profile.address}`)
          const cacheTime = localStorage.getItem(`activities_${profile.address}_time`)
          
          if (cachedActivities && cacheTime) {
            const age = Date.now() - parseInt(cacheTime)
            if (age < 5 * 60 * 1000) { // 5 minutes cache
              const parsed = JSON.parse(cachedActivities)
              const activitiesWithDates = parsed.map((activity: any) => ({
                ...activity,
                timestamp: new Date(activity.timestamp)
              }))
              set({ activities: activitiesWithDates, isActivitiesLoading: false })
              return
            }
          }

          // Load from API
          const response = await fetch(`/api/users/${profile.address}/activities`)
          if (response.ok) {
            const { activities: activitiesData } = await response.json()
            const activitiesWithDates = activitiesData.map((activity: any) => ({
              ...activity,
              timestamp: new Date(activity.timestamp)
            }))
            set({ activities: activitiesWithDates })
            localStorage.setItem(`activities_${profile.address}`, JSON.stringify(activitiesData))
            localStorage.setItem(`activities_${profile.address}_time`, Date.now().toString())
          } else {
            set({ activities: [] })
          }
        } catch (error) {
          console.error("Error loading activities:", error)
          set({ activities: [] })
        } finally {
          set({ isActivitiesLoading: false })
        }
      },

      // Utility functions
      getDisplayName: () => {
        const { profile } = get()
        if (!profile) return "Anonymous"
        return profile.displayName || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`
      },

      formatReputation: () => {
        const { profile } = get()
        if (!profile) return "0"
        const rep = profile.reputation
        if (rep >= 1000) return `${(rep / 1000).toFixed(1)}k`
        return rep.toString()
      },

      // Verification Actions
      initiateKYC: async (): Promise<boolean> => {
        const { profile } = get()
        if (!profile) return false
        
        try {
          // TODO: Integrate with Self Protocol or other KYC provider
          console.log("Initiating KYC process...")
          return true
        } catch (error) {
          console.error("Error initiating KYC:", error)
          return false
        }
      },

      checkVerificationStatus: async () => {
        const { profile } = get()
        if (!profile) return
        
        try {
          // TODO: Check verification status from backend
          console.log("Checking verification status...")
        } catch (error) {
          console.error("Error checking verification status:", error)
        }
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        profile: state.profile,
        activities: state.activities.slice(0, 10) // Only persist last 10 activities
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useProfile = () => useUserStore(state => state.profile)
export const useProfileLoading = () => useUserStore(state => state.isProfileLoading)
export const useActivities = () => useUserStore(state => state.activities)
export const useActivitiesLoading = () => useUserStore(state => state.isActivitiesLoading)
export const useDisplayName = () => useUserStore(state => state.getDisplayName())
export const useReputation = () => useUserStore(state => state.formatReputation())