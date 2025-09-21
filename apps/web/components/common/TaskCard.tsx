"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Calendar, Award, User } from "lucide-react"

interface TaskCardProps {
  id: string
  title: string
  description: string
  deadline: string
  prize: string
  status: "Open" | "Judging" | "Closed"
  submissions: number
  creator: string
  showActions?: boolean
}

export function TaskCard({
  id,
  title,
  description,
  deadline,
  prize,
  status,
  submissions,
  creator,
  showActions = true,
}: TaskCardProps) {
  const statusColor = {
    Open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Judging: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <Badge className={statusColor[status]}>{status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Deadline: {deadline}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-mono">{prize}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">{creator}</span>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {submissions} submission{submissions !== 1 ? 's' : ''}
          </span>
          <Button asChild size="sm">
            <Link href={`/task/${id}`}>View Task</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}