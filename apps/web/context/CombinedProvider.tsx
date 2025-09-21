"use client"

import { type ReactNode } from "react"
import { AppProvider } from "./AppContext"
import { UserProvider } from "./UserContext"
import { TaskProvider } from "./TaskContext"
import { NotificationProvider } from "./NotificationContext"

interface CombinedProviderProps {
  children: ReactNode
}

export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <AppProvider>
      <NotificationProvider>
        <UserProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </UserProvider>
      </NotificationProvider>
    </AppProvider>
  )
}