"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount, usePublicClient } from "wagmi"

interface Task {
  id: string
  title: string
  description: string
  criteria: string[]
  deadline: Date
  prize: string
  tokenAddress: string
  status: "Open" | "Judging" | "Closed"
  submissions: number
  creator: string
  createdAt: Date
  taskType: "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "OMI_DEVICE"
  
  // Verification requirements
  minimumAge?: number
  excludedCountries: string[]
  ofacRequired: boolean
  
  // Blockchain data
  onChainId?: number
  transactionHash?: string
  blockNumber?: number
}

interface TaskFilter {
  status?: "Open" | "Judging" | "Closed" | "All"
  taskType?: string
  minPrize?: number
  maxPrize?: number
  creator?: string
  sortBy?: "newest" | "oldest" | "prize_high" | "prize_low" | "deadline"
}

interface TaskContextType {
  // State
  tasks: Task[]
  filteredTasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  filter: TaskFilter
  
  // Task Management
  loadTasks: (force?: boolean) => Promise<void>
  loadTask: (id: string) => Promise<Task | null>
  refreshTask: (id: string) => Promise<void>
  
  // Filtering & Search
  setFilter: (filter: Partial<TaskFilter>) => void
  clearFilter: () => void
  searchTasks: (query: string) => void
  
  // User's Tasks
  getMyTasks: () => Task[]
  getMySubmissions: () => Task[]
  
  // Task Actions
  submitToTask: (taskId: string, submission: any) => Promise<boolean>
  registerForTask: (taskId: string) => Promise<boolean>
  
  // Utilities
  getTasksByStatus: (status: Task["status"]) => Task[]
  getTotalPrizePool: () => string
  getTaskStats: () => {
    total: number
    open: number
    judging: number
    closed: number
  }
}

const defaultFilter: TaskFilter = {
  status: "All",
  sortBy: "newest",
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilterState] = useState<TaskFilter>(defaultFilter)
  
  const { address } = useAccount()
  const publicClient = usePublicClient()

  // Load tasks on mount and when wallet changes
  useEffect(() => {
    loadTasks()
  }, [address])

  // Apply filters when tasks or filter changes
  useEffect(() => {
    applyFilters()
  }, [tasks, filter])

  const loadTasks = async (force = false) => {
    setIsLoading(true)
    try {
      // Check cache first (unless forced)
      if (!force) {
        const cached = localStorage.getItem("taskVault_tasks")
        const cacheTime = localStorage.getItem("taskVault_tasks_time")
        
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime)
          if (age < 5 * 60 * 1000) { // 5 minutes cache
            const cachedTasks = JSON.parse(cached)
            // Convert date strings back to Date objects
            const tasksWithDates = cachedTasks.map((task: any) => ({
              ...task,
              deadline: new Date(task.deadline),
              createdAt: new Date(task.createdAt),
            }))
            setTasks(tasksWithDates)
            setIsLoading(false)
            return
          }
        }
      }

      // Load from database via API
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const { tasks: tasksData } = await response.json()
      
      // Transform API response to match our Task interface
      const transformedTasks: Task[] = tasksData.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        criteria: task.criteria || [],
        deadline: new Date(task.deadline),
        prize: task.prize,
        tokenAddress: task.tokenAddress,
        status: task.status as "Open" | "Judging" | "Closed",
        submissions: task.submissions,
        creator: task.creator,
        createdAt: new Date(task.createdAt),
        taskType: task.taskType as "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "OMI_DEVICE",
        excludedCountries: task.excludedCountries || [],
        ofacRequired: task.ofacRequired || false,
        onChainId: task.onChainId,
        transactionHash: task.transactionHash,
        blockNumber: task.blockNumber,
      }))

      setTasks(transformedTasks)
      
      // Cache the results
      localStorage.setItem("taskVault_tasks", JSON.stringify(transformedTasks))
      localStorage.setItem("taskVault_tasks_time", Date.now().toString())
      
    } catch (error) {
      console.error("Error loading tasks:", error)
      // Set empty array on error instead of showing mock data
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadTask = async (id: string): Promise<Task | null> => {
    try {
      // First check if it's already in our tasks array
      const existingTask = tasks.find(t => t.id === id)
      if (existingTask) {
        setCurrentTask(existingTask)
        return existingTask
      }

      // Load specific task from API
      const response = await fetch(`/api/tasks/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }
      
      const { task: taskData } = await response.json()
      
      if (taskData) {
        const transformedTask: Task = {
          id: taskData.taskId,
          title: taskData.title,
          description: taskData.description,
          criteria: taskData.criteria || [],
          deadline: new Date(taskData.deadline),
          prize: taskData.amount,
          tokenAddress: taskData.tokenAddress,
          status: "Open", // Compute based on deadline and other factors
          submissions: 0, // Would need to fetch from submissions API
          creator: taskData.createdBy,
          createdAt: new Date(taskData.createdAt),
          taskType: taskData.taskType as "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "OMI_DEVICE",
          excludedCountries: [],
          ofacRequired: false,
        }
        
        setCurrentTask(transformedTask)
        return transformedTask
      }
      
      return null
    } catch (error) {
      console.error("Error loading task:", error)
      return null
    }
  }

  const refreshTask = async (id: string) => {
    const task = await loadTask(id)
    if (task) {
      setTasks(prev => prev.map(t => t.id === id ? task : t))
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Status filter
    if (filter.status && filter.status !== "All") {
      filtered = filtered.filter(task => task.status === filter.status)
    }

    // Task type filter
    if (filter.taskType) {
      filtered = filtered.filter(task => task.taskType === filter.taskType)
    }

    // Creator filter
    if (filter.creator) {
      filtered = filtered.filter(task => task.creator.toLowerCase() === filter.creator?.toLowerCase())
    }

    // Prize filters
    if (filter.minPrize) {
      filtered = filtered.filter(task => parseFloat(task.prize) >= filter.minPrize!)
    }
    if (filter.maxPrize) {
      filtered = filtered.filter(task => parseFloat(task.prize) <= filter.maxPrize!)
    }

    // Sorting
    if (filter.sortBy) {
      switch (filter.sortBy) {
        case "newest":
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          break
        case "oldest":
          filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          break
        case "prize_high":
          filtered.sort((a, b) => parseFloat(b.prize) - parseFloat(a.prize))
          break
        case "prize_low":
          filtered.sort((a, b) => parseFloat(a.prize) - parseFloat(b.prize))
          break
        case "deadline":
          filtered.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
          break
      }
    }

    setFilteredTasks(filtered)
  }

  const setFilter = (newFilter: Partial<TaskFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }))
  }

  const clearFilter = () => {
    setFilterState(defaultFilter)
  }

  const searchTasks = (query: string) => {
    if (!query.trim()) {
      setFilteredTasks(tasks)
      return
    }

    const searchResults = tasks.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase()) ||
      task.criteria.some(c => c.toLowerCase().includes(query.toLowerCase()))
    )
    
    setFilteredTasks(searchResults)
  }

  const getMyTasks = (): Task[] => {
    if (!address) return []
    return tasks.filter(task => task.creator.toLowerCase() === address.toLowerCase())
  }

  const getMySubmissions = (): Task[] => {
    if (!address) return []
    
    // Filter tasks where current user has made submissions
    // This is a simplified version - in reality you'd want to track this more efficiently
    return tasks.filter(task => {
      // This would require additional API call to check user's submissions
      // For now, return empty array - this should be implemented with proper submission tracking
      return false
    })
  }

  const submitToTask = async (taskId: string, submission: any): Promise<boolean> => {
    try {
      if (!address) {
        throw new Error("Wallet not connected")
      }

      // First, ensure user exists in database
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to create/get user')
      }
      
      const { user } = await userResponse.json()

      // Submit to task
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId: user.id,
          contentHash: submission.contentHash || JSON.stringify(submission)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit to task')
      }

      // Refresh tasks to update submission count
      await loadTasks(true)
      return true
    } catch (error) {
      console.error("Error submitting to task:", error)
      return false
    }
  }

  const registerForTask = async (taskId: string): Promise<boolean> => {
    try {
      // Registration logic would depend on your business requirements
      // For now, just validate that task exists and user is eligible
      const task = await loadTask(taskId)
      if (!task) {
        throw new Error("Task not found")
      }
      
      if (!address) {
        throw new Error("Wallet not connected")
      }

      // Check if task is still open
      if (task.deadline < new Date()) {
        throw new Error("Task deadline has passed")
      }

      console.log("Registered for task:", taskId)
      return true
    } catch (error) {
      console.error("Error registering for task:", error)
      return false
    }
  }

  const getTasksByStatus = (status: Task["status"]): Task[] => {
    return tasks.filter(task => task.status === status)
  }

  const getTotalPrizePool = (): string => {
    const total = tasks.reduce((sum, task) => sum + parseFloat(task.prize), 0)
    return total.toFixed(2)
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      open: getTasksByStatus("Open").length,
      judging: getTasksByStatus("Judging").length,
      closed: getTasksByStatus("Closed").length,
    }
  }

  const value: TaskContextType = {
    tasks,
    filteredTasks,
    currentTask,
    isLoading,
    filter,
    loadTasks,
    loadTask,
    refreshTask,
    setFilter,
    clearFilter,
    searchTasks,
    getMyTasks,
    getMySubmissions,
    submitToTask,
    registerForTask,
    getTasksByStatus,
    getTotalPrizePool,
    getTaskStats,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTask = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}