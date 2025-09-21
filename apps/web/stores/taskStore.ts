"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  taskType: "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "TELEGRAM_GROUP"
  telegramChatId?: string
  excludedCountries: string[]
  ofacRequired: boolean
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

interface TaskStore {
  // State
  tasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  filter: TaskFilter
  
  // Computed state (using selectors)
  filteredTasks: Task[]
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setCurrentTask: (task: Task | null) => void
  setLoading: (loading: boolean) => void
  setFilter: (filter: Partial<TaskFilter>) => void
  clearFilter: () => void
  
  // API Actions
  loadTasks: () => Promise<void>
  loadTask: (id: string) => Promise<Task | null>
  refreshTask: (id: string) => Promise<void>
  
  // Computed getters
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

const applyFilters = (tasks: Task[], filter: TaskFilter): Task[] => {
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

  return filtered
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      currentTask: null,
      isLoading: false,
      filter: defaultFilter,
      
      // Computed state
      get filteredTasks() {
        const { tasks, filter } = get()
        return applyFilters(tasks, filter)
      },

      // Actions
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({ 
        tasks: [task, ...state.tasks] 
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      
      setCurrentTask: (task) => set({ currentTask: task }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setFilter: (newFilter) => set((state) => ({ 
        filter: { ...state.filter, ...newFilter } 
      })),
      
      clearFilter: () => set({ filter: defaultFilter }),

      // API Actions
      loadTasks: async () => {
        set({ isLoading: true })
        try {
          // Check cache first
          const cached = localStorage.getItem("taskVault_tasks")
          const cacheTime = localStorage.getItem("taskVault_tasks_time")
          
          if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime)
            if (age < 5 * 60 * 1000) { // 5 minutes cache
              const cachedTasks = JSON.parse(cached)
              const tasksWithDates = cachedTasks.map((task: any) => ({
                ...task,
                deadline: new Date(task.deadline),
                createdAt: new Date(task.createdAt),
              }))
              set({ tasks: tasksWithDates, isLoading: false })
              return
            }
          }

          // Load from API
          const response = await fetch('/api/tasks')
          if (!response.ok) {
            throw new Error('Failed to fetch tasks')
          }
          
          const { tasks: tasksData } = await response.json()
          
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
            taskType: task.taskType as "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "TELEGRAM_GROUP",
            telegramChatId: task.telegramChatId,
            excludedCountries: task.excludedCountries || [],
            ofacRequired: task.ofacRequired || false,
            onChainId: task.onChainId,
            transactionHash: task.transactionHash,
            blockNumber: task.blockNumber,
          }))

          set({ tasks: transformedTasks })
          
          // Cache the results
          localStorage.setItem("taskVault_tasks", JSON.stringify(transformedTasks))
          localStorage.setItem("taskVault_tasks_time", Date.now().toString())
          
        } catch (error) {
          console.error("Error loading tasks:", error)
          set({ tasks: [] })
        } finally {
          set({ isLoading: false })
        }
      },

      loadTask: async (id: string): Promise<Task | null> => {
        try {
          const { tasks } = get()
          
          // First check if it's already in our tasks array
          const existingTask = tasks.find(t => t.id === id)
          if (existingTask) {
            set({ currentTask: existingTask })
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
              status: "Open",
              submissions: 0,
              creator: taskData.createdBy,
              createdAt: new Date(taskData.createdAt),
              taskType: taskData.taskType as "TWITTER_INTERACT" | "CONTENT_DELIVERY" | "TELEGRAM_GROUP",
              telegramChatId: taskData.telegramChatId,
              excludedCountries: [],
              ofacRequired: false,
            }
            
            set({ currentTask: transformedTask })
            return transformedTask
          }
          
          return null
        } catch (error) {
          console.error("Error loading task:", error)
          return null
        }
      },

      refreshTask: async (id: string) => {
        const task = await get().loadTask(id)
        if (task) {
          get().updateTask(id, task)
        }
      },

      // Computed getters
      getTasksByStatus: (status: Task["status"]) => {
        const { tasks } = get()
        return tasks.filter(task => task.status === status)
      },

      getTotalPrizePool: () => {
        const { tasks } = get()
        const total = tasks.reduce((sum, task) => sum + parseFloat(task.prize), 0)
        return total.toFixed(2)
      },

      getTaskStats: () => {
        const { tasks } = get()
        return {
          total: tasks.length,
          open: tasks.filter(task => task.status === "Open").length,
          judging: tasks.filter(task => task.status === "Judging").length,
          closed: tasks.filter(task => task.status === "Closed").length,
        }
      },
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        tasks: state.tasks,
        filter: state.filter 
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useFilteredTasks = () => useTaskStore(state => state.filteredTasks)
export const useTasks = () => useTaskStore(state => state.tasks)
export const useCurrentTask = () => useTaskStore(state => state.currentTask)
export const useTasksLoading = () => useTaskStore(state => state.isLoading)
export const useTaskFilter = () => useTaskStore(state => state.filter)
export const useTaskStats = () => useTaskStore(state => state.getTaskStats())