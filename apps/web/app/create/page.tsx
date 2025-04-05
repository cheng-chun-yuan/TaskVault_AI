"use client"

import dynamic from "next/dynamic"

const MultiStepTaskForm = dynamic(
  () => import("@/components/create/multi-step"),
  { ssr: false }
)

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-background">
      <MultiStepTaskForm />
    </main>
  )
}