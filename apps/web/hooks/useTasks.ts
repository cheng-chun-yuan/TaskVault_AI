"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query"

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

// Fetch functions
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }
  
  const { tasks: tasksData } = await response.json()
  
  return tasksData.map((task: any) => ({
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
}

const fetchTask = async (id: string): Promise<Task | null> => {
  const response = await fetch(`/api/tasks/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch task')
  }
  
  const { task: taskData } = await response.json()
  
  if (!taskData) return null
  
  return {
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
}

const createTask = async (taskData: any): Promise<Task> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create task')
  }
  
  return response.json()
}

const joinTask = async ({ taskId, walletAddress }: { taskId: string; walletAddress: string }) => {
  const response = await fetch(`/api/tasks/${taskId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  })
  
  if (!response.ok) {
    throw new Error('Failed to join task')
  }
  
  return response.json()
}

// React Query hooks
export const useTasks = (filters?: TaskFilter) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters || {}),
    queryFn: fetchTasks,
    select: (data) => {
      if (!filters) return data
      
      let filtered = [...data]
      
      // Apply filters
      if (filters.status && filters.status !== "All") {
        filtered = filtered.filter(task => task.status === filters.status)
      }
      
      if (filters.taskType) {
        filtered = filtered.filter(task => task.taskType === filters.taskType)
      }
      
      if (filters.creator) {
        filtered = filtered.filter(task => task.creator.toLowerCase() === filters.creator?.toLowerCase())
      }
      
      if (filters.minPrize) {
        filtered = filtered.filter(task => parseFloat(task.prize) >= filters.minPrize!)
      }
      
      if (filters.maxPrize) {
        filtered = filtered.filter(task => parseFloat(task.prize) <= filters.maxPrize!)
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
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
  })
}

export const useTask = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => fetchTask(id),
    enabled: !!id,
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export const useJoinTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: joinTask,
    onSuccess: (_, variables) => {
      // Invalidate specific task and all tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

// Utility hooks
export const useTaskStats = () => {
  const { data: tasks = [] } = useTasks()
  
  return {
    total: tasks.length,
    open: tasks.filter(task => task.status === "Open").length,
    judging: tasks.filter(task => task.status === "Judging").length,
    closed: tasks.filter(task => task.status === "Closed").length,
    totalPrizePool: tasks.reduce((sum, task) => sum + parseFloat(task.prize), 0).toFixed(2)
  }
}

export const useMyTasks = (address?: string) => {
  return useTasks({ creator: address })
}