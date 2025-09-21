"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import type { User, Task, WalletState } from '@/types'

// Unified app state interface
interface AppState {
  wallet: WalletState
  user: User | null
  tasks: Task[]
  notifications: Notification[]
  ui: {
    theme: 'light' | 'dark'
    sidebarOpen: boolean
    loading: {[key: string]: boolean}
  }
}

// Action types for state updates
type AppAction = 
  | { type: 'SET_WALLET'; payload: WalletState }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'RESET_STATE' }

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Initial state
const initialState: AppState = {
  wallet: {
    address: undefined,
    isConnected: false,
    chainId: undefined,
  },
  user: null,
  tasks: [],
  notifications: [],
  ui: {
    theme: 'light',
    sidebarOpen: false,
    loading: {},
  },
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.payload }
    
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      }
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      }
    
    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
      }
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            [action.payload.key]: action.payload.loading,
          },
        },
      }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Context creation
const AppStateContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider component
interface AppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}

// Custom hook to use app state
export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}

// Selector hooks for specific parts of state (prevents unnecessary re-renders)
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useAppState()
  return selector(state)
}

// Convenience hooks for common state access patterns
export function useWalletState() {
  return useAppSelector(state => state.wallet)
}

export function useUserState() {
  return useAppSelector(state => state.user)
}

export function useTasksState() {
  return useAppSelector(state => state.tasks)
}

export function useNotifications() {
  const { state, dispatch } = useAppState()
  
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id },
    })
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    }, duration)
  }
  
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }
  
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
  }
}

export function useUIState() {
  const { state, dispatch } = useAppState()
  
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }
  
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }
  
  const setLoading = (key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } })
  }
  
  return {
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    loading: state.ui.loading,
    setTheme,
    toggleSidebar,
    setLoading,
  }
}