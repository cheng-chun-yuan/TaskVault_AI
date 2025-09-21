export interface Judge {
  name: string
  style: string
}

export type TaskType = 'TWITTER_INTERACT' | 'CONTENT_DELIVERY' | 'TELEGRAM_GROUP'

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
  maxPerTime: string
  maxPerDay: string
  createdBy: string
  taskType: TaskType
  telegramChatId?: string
  submissionTag?: string
  rewardTiming?: 'INSTANT' | 'POST_EVENT'
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
  maxPerTime?: string
  maxPerDay?: string
  taskType?: string
  telegramChatId?: string
  submissionTag?: string
  rewardTiming?: string
  [key: `judge${number}`]: string | undefined
}