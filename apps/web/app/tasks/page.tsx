"use client"

import dynamicImport from "next/dynamic"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

// Force dynamic rendering to prevent SSR issues with web3 hooks and zkEmail SDK
export const dynamic = 'force-dynamic'

// Dynamically import the component that uses React Query hooks
const TasksPageContent = dynamicImport(() => import("./TasksPageContent"), { ssr: false });

export default function TasksPage() {
  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Tasks</h1>
          <p className="text-muted-foreground mt-1">Find tasks that match your skills and earn rewards</p>
        </div>
        <Button asChild>
          <Link href="/create">Create New Task</Link>
        </Button>
      </div>

      <TasksPageContent />
    </div>
  )
}
