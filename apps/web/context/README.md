# TaskVault AI Context System

This document explains how to use the expanded context system for global state management across the TaskVault AI application.

## Available Contexts

### 1. **AppContext** (`useApp`)
Manages global application state including UI preferences, loading states, and network information.

```tsx
import { useApp } from '@/context'

function MyComponent() {
  const { 
    state, 
    toggleDarkMode, 
    setLoading, 
    formatCurrency 
  } = useApp()
  
  return (
    <div>
      <p>Chain ID: {state.chainId}</p>
      <p>Currency: {formatCurrency("1.5")}</p>
      <button onClick={toggleDarkMode}>Toggle Theme</button>
    </div>
  )
}
```

### 2. **UserContext** (`useUser`)
Manages user profile, authentication state, activities, and verification status.

```tsx
import { useUser } from '@/context'

function UserProfile() {
  const { 
    profile, 
    updateProfile, 
    addActivity, 
    getDisplayName 
  } = useUser()
  
  const handleProfileUpdate = async () => {
    await updateProfile({ displayName: "New Name" })
  }
  
  return (
    <div>
      <h2>{getDisplayName()}</h2>
      <p>Reputation: {profile?.reputation}</p>
      <button onClick={handleProfileUpdate}>Update Profile</button>
    </div>
  )
}
```

### 3. **TaskContext** (`useTask`)
Manages all task-related state including loading, filtering, and task actions.

```tsx
import { useTask } from '@/context'

function TaskList() {
  const { 
    filteredTasks, 
    isLoading, 
    setFilter, 
    searchTasks,
    getTaskStats 
  } = useTask()
  
  const stats = getTaskStats()
  
  return (
    <div>
      <p>Total Tasks: {stats.total}</p>
      <input 
        placeholder="Search tasks..." 
        onChange={(e) => searchTasks(e.target.value)} 
      />
      {filteredTasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

### 4. **NotificationContext** (`useNotification`)
Manages notifications, toasts, and alerts with specialized methods for different types.

```tsx
import { useNotification } from '@/context'

function TaskCreation() {
  const { 
    success, 
    error, 
    txPending, 
    txSuccess, 
    taskCreated 
  } = useNotification()
  
  const handleCreateTask = async () => {
    try {
      success("Creating task...", "Please wait while we process your request")
      
      const txHash = await createTaskTransaction()
      txPending(txHash, "Task Creation Transaction Pending")
      
      const result = await waitForTransaction(txHash)
      txSuccess(txHash, "Task Created Successfully")
      
      taskCreated(result.taskId, "My New Task")
    } catch (err) {
      error("Failed to create task", err.message)
    }
  }
  
  return <button onClick={handleCreateTask}>Create Task</button>
}
```

### 5. **TaskFormContext** (`useTaskForm`)
Manages multi-step task creation form state (existing context, now enhanced).

```tsx
import { useTaskForm } from '@/context'

function TaskForm() {
  const { 
    currentStep, 
    formData, 
    errors, 
    updateFormData, 
    validateStep 
  } = useTaskForm()
  
  return (
    <form>
      <input 
        value={formData.title}
        onChange={(e) => updateFormData("title", e.target.value)}
      />
      {errors.title && <span>{errors.title}</span>}
    </form>
  )
}
```

## Usage Patterns

### 1. **Component-Level Usage**
Import and use contexts directly in components:

```tsx
import { useUser, useNotification, useTask } from '@/context'

function MyComponent() {
  const { profile } = useUser()
  const { success } = useNotification()
  const { loadTasks } = useTask()
  
  // Use context methods and state
}
```

### 2. **Cross-Context Communication**
Contexts can work together. For example, when a task is created:

```tsx
function CreateTaskButton() {
  const { addActivity } = useUser()
  const { taskCreated } = useNotification()
  const { loadTasks } = useTask()
  
  const handleCreate = async (taskData) => {
    // Create task...
    
    // Update user activities
    addActivity({
      type: "task_created",
      title: `Created: ${taskData.title}`,
      description: `Prize: ${taskData.prize} ETH`
    })
    
    // Show notification
    taskCreated(taskId, taskData.title)
    
    // Refresh task list
    await loadTasks(true)
  }
}
```

### 3. **Global State Access**
Access global state anywhere in your component tree:

```tsx
// No need to pass props down multiple levels
function DeepNestedComponent() {
  const { state } = useApp()
  const { profile } = useUser()
  
  return (
    <div>
      <p>Network: {state.chainId}</p>
      <p>User: {profile?.displayName}</p>
    </div>
  )
}
```

## Setup

The contexts are automatically available throughout your app via the `CombinedProvider` in `components/layout/providers.tsx`:

```tsx
import { CombinedProvider } from '@/context'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <CombinedProvider>
        {children}
      </CombinedProvider>
    </ThemeProvider>
  )
}
```

## Benefits

1. **Centralized State Management**: All global state is managed in one place
2. **Type Safety**: Full TypeScript support with proper typing
3. **Performance**: React Context with proper optimization
4. **Persistence**: Automatic localStorage integration for user preferences
5. **Real-time Updates**: State changes propagate to all consuming components
6. **Developer Experience**: Clean APIs with helpful utility methods

## Best Practices

1. **Use Specific Contexts**: Import only the contexts you need
2. **Combine Related Actions**: Use multiple context methods together for complex operations
3. **Handle Loading States**: Always check loading states before rendering
4. **Error Handling**: Use notification context for consistent error messaging
5. **Performance**: Avoid overusing contexts for frequently changing data

## Migration from Props/State

**Before:**
```tsx
// Props drilling
function Parent() {
  const [user, setUser] = useState()
  const [tasks, setTasks] = useState()
  
  return <Child user={user} tasks={tasks} setUser={setUser} />
}

function Child({ user, tasks, setUser }) {
  return <GrandChild user={user} tasks={tasks} setUser={setUser} />
}
```

**After:**
```tsx
// Context usage
function Parent() {
  return <Child />
}

function Child() {
  return <GrandChild />
}

function GrandChild() {
  const { profile, updateProfile } = useUser()
  const { tasks } = useTask()
  
  // Direct access to global state
}
```