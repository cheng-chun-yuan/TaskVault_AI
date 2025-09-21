"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@workspace/ui/hooks/use-toast"

interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
}

interface NotificationContextType {
  // State
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  
  // Convenience methods
  success: (title: string, description?: string, options?: Partial<Notification>) => string
  error: (title: string, description?: string, options?: Partial<Notification>) => string
  warning: (title: string, description?: string, options?: Partial<Notification>) => string
  info: (title: string, description?: string, options?: Partial<Notification>) => string
  
  // Transaction notifications
  txPending: (hash: string, title?: string) => string
  txSuccess: (hash: string, title?: string) => string
  txError: (hash: string, title?: string, error?: string) => string
  
  // Task-specific notifications
  taskCreated: (taskId: string, title: string) => string
  taskSubmitted: (taskId: string, title: string) => string
  taskJudged: (taskId: string, title: string, won: boolean) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp">): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      ...notificationData,
      id,
      timestamp: new Date(),
    }

    setNotifications(prev => [notification, ...prev])

    // Also show as toast
    toast({
      title: notification.title,
      description: notification.description,
      variant: notification.type === "error" ? "destructive" : "default",
      duration: notification.duration,
    })

    // Auto remove after duration (unless persistent)
    if (!notification.persistent) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const markAsRead = (id: string) => {
    // TODO: Implement read status if needed
    console.log("Marking notification as read:", id)
  }

  const markAllAsRead = () => {
    // TODO: Implement read status if needed
    console.log("Marking all notifications as read")
  }

  // Convenience methods
  const success = (title: string, description?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: "success",
      title,
      description,
      duration: 4000,
      ...options,
    })
  }

  const error = (title: string, description?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: "error",
      title,
      description,
      duration: 6000,
      ...options,
    })
  }

  const warning = (title: string, description?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: "warning",
      title,
      description,
      duration: 5000,
      ...options,
    })
  }

  const info = (title: string, description?: string, options?: Partial<Notification>): string => {
    return addNotification({
      type: "info",
      title,
      description,
      duration: 4000,
      ...options,
    })
  }

  // Transaction notifications
  const txPending = (hash: string, title = "Transaction Pending"): string => {
    return addNotification({
      type: "info",
      title,
      description: `Transaction hash: ${hash.slice(0, 10)}...`,
      persistent: true,
      action: {
        label: "View on Explorer",
        onClick: () => {
          // TODO: Open block explorer
          window.open(`https://etherscan.io/tx/${hash}`, "_blank")
        }
      }
    })
  }

  const txSuccess = (hash: string, title = "Transaction Successful"): string => {
    return addNotification({
      type: "success",
      title,
      description: `Transaction confirmed: ${hash.slice(0, 10)}...`,
      duration: 6000,
      action: {
        label: "View on Explorer",
        onClick: () => {
          window.open(`https://etherscan.io/tx/${hash}`, "_blank")
        }
      }
    })
  }

  const txError = (hash: string, title = "Transaction Failed", error?: string): string => {
    return addNotification({
      type: "error",
      title,
      description: error || `Transaction failed: ${hash.slice(0, 10)}...`,
      duration: 8000,
      action: {
        label: "View on Explorer",
        onClick: () => {
          window.open(`https://etherscan.io/tx/${hash}`, "_blank")
        }
      }
    })
  }

  // Task-specific notifications
  const taskCreated = (taskId: string, title: string): string => {
    return addNotification({
      type: "success",
      title: "Task Created Successfully",
      description: `"${title}" is now live and accepting submissions`,
      action: {
        label: "View Task",
        onClick: () => {
          window.location.href = `/task/${taskId}`
        }
      }
    })
  }

  const taskSubmitted = (taskId: string, title: string): string => {
    return addNotification({
      type: "success",
      title: "Submission Sent",
      description: `Your submission for "${title}" has been received`,
      action: {
        label: "View Task",
        onClick: () => {
          window.location.href = `/task/${taskId}`
        }
      }
    })
  }

  const taskJudged = (taskId: string, title: string, won: boolean): string => {
    return addNotification({
      type: won ? "success" : "info",
      title: won ? "Congratulations! You Won!" : "Task Judged",
      description: won 
        ? `You've been selected as the winner for "${title}"`
        : `Judging completed for "${title}"`,
      persistent: won,
      action: {
        label: "View Results",
        onClick: () => {
          window.location.href = `/task/${taskId}`
        }
      }
    })
  }

  const unreadCount = notifications.length // Simplified - you could track read status

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    success,
    error,
    warning,
    info,
    txPending,
    txSuccess,
    txError,
    taskCreated,
    taskSubmitted,
    taskJudged,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}