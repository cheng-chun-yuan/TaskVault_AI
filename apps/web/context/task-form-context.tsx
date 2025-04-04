"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { TaskFormData, FormErrors, Judge } from "@/types/task-form"
import { calculateStyleHash } from "@/lib/utils"
import { useAccount } from "wagmi"

interface TaskFormContextType {
  currentStep: number
  formData: TaskFormData
  errors: FormErrors
  setCurrentStep: (step: number) => void
  updateFormData: <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => void
  updateJudge: (index: number, field: keyof Judge, value: string) => void
  addJudge: () => void
  removeJudge: (index: number) => void
  addCriterion: (criterion: string) => void
  removeCriterion: (index: number) => void
  validateStep: (step: number) => boolean
  setErrors: (errors: FormErrors) => void
  generateStyleCommit: () => void
}

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  criteria: [],
  deadline: undefined,
  minimumAge: 18,
  excludedCountries: [],
  ofac: false,
  judges: [{ name: "", style: "" }],
  styleCommit: undefined,
  tokenAddress: "",
  amount: "",
  createdBy: "",
  taskType: "TWITTER_INTERACT"
}

export const TaskFormContext = createContext<TaskFormContextType | undefined>(undefined)

export function TaskFormProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      updateFormData("createdBy", address)
    }
  }, [address])

  const updateFormData = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when field is updated
    if (field in errors) {
      const newErrors = { ...errors }
      delete newErrors[field as keyof FormErrors]
      setErrors(newErrors)
    }
  }

  const addCriterion = (criterion: string) => {
    updateFormData("criteria", [...formData.criteria, criterion])
  }

  const removeCriterion = (index: number) => {
    const newCriteria = [...formData.criteria]
    newCriteria.splice(index, 1)
    updateFormData("criteria", newCriteria)
  }

  const addJudge = () => {
    updateFormData("judges", [...formData.judges, { name: "", style: "" }])
  }

  const updateJudge = (index: number, field: keyof Judge, value: string) => {
    const newJudges = [...formData.judges]
    const currentJudge = newJudges[index] || { name: "", style: "" }
    newJudges[index] = { ...currentJudge, [field]: value }
    updateFormData("judges", newJudges)

    // Clear judge-specific error
    const judgeErrorKey = `judge${index}` as `judge${number}`
    if (judgeErrorKey in errors) {
      const newErrors = { ...errors }
      delete newErrors[judgeErrorKey]
      setErrors(newErrors)
    }
  }

  const removeJudge = (index: number) => {
    const newJudges = [...formData.judges]
    newJudges.splice(index, 1)
    updateFormData("judges", newJudges)
  }

  const generateStyleCommit = () => {
    const judgeStyles = formData.judges.map(judge => judge.style).filter(style => style.trim())
    if (!formData.criteria.length || !judgeStyles.length) {
      setErrors({
        ...errors,
        judges: "Please fill in all judge styles and criteria before generating commitment"
      })
      return
    }

    const combinedStyle = judgeStyles.join("|")
    const hash = calculateStyleHash(formData.criteria, combinedStyle, formData.judges.map(j => j.name).join("|"))
    updateFormData("styleCommit", hash)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = "Title is required"
        if (!formData.description) newErrors.description = "Description is required"
        if (formData.criteria.length === 0) newErrors.criteria = "At least one criterion is required"
        if (!formData.deadline) newErrors.deadline = "Deadline is required"
        break

      case 2:
        // Verification step validation
        break

      case 3:
        // Validate each judge
        formData.judges.forEach((judge, index) => {
          if (!judge.name || !judge.style) {
            newErrors[`judge${index}`] = "Judge name and style are required"
          }
        })
        // Validate style commitment
        if (!formData.styleCommit) {
          newErrors.styleCommit = "Style commitment is required"
        }
        break

      case 4:
        if (!formData.tokenAddress) newErrors.tokenAddress = "Token address is required"
        if (!formData.amount) newErrors.amount = "Amount is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const value: TaskFormContextType = {
    currentStep,
    formData,
    errors,
    setCurrentStep,
    updateFormData,
    updateJudge,
    addJudge,
    removeJudge,
    addCriterion,
    removeCriterion,
    validateStep,
    setErrors,
    generateStyleCommit,
  }

  return (
    <TaskFormContext.Provider value={value}>
      {children}
    </TaskFormContext.Provider>
  )
}

export const useTaskForm = () => {
  const context = useContext(TaskFormContext)
  if (context === undefined) {
    throw new Error("useTaskForm must be used within a TaskFormProvider")
  }
  return context
}
