export interface Judge {
  name: string
  style: string
}

export type TaskType = 'TWITTER_INTERACT' | 'CONTENT_DELIVERY' | 'OMI_AI_DEVICE'

export interface TaskFormData {
  title: string
  description: string
  criteria: string[]
  deadline: Date | undefined
  minimumAge: number
  excludedCountries: string[]
  ofac: boolean
  judges: Judge[]
  styleCommit: string | undefined
  tokenAddress: string
  amount: string
  createdBy: string
  taskType: TaskType
}

export interface FormErrors {
  [key: string]: string | undefined
  title?: string
  description?: string
  criteria?: string
  deadline?: string
  judges?: string
  styleCommit?: string
  tokenAddress?: string
  amount?: string
  taskType?: string
  [key: `judge${number}`]: string | undefined
}