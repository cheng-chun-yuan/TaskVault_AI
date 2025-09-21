"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Calendar, Award, User, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const statusConfig = {
    Open: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: "🟢",
      gradient: "from-emerald-500/20 to-blue-500/20"
    },
    Judging: {
      color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      icon: "⏳",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    Closed: {
      color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800",
      icon: "🏁",
      gradient: "from-slate-500/20 to-gray-500/20"
    },
  }

  const config = statusConfig[status]
  const isActive = status === "Open"
  
  // Calculate urgency (mock calculation based on deadline)
  const isUrgent = deadline.includes("1 day") || deadline.includes("2 days")

  return (
    <Link href={`/task/${id}`} className="block group">
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border-2 hover:border-primary/20",
        "bg-gradient-to-br",
        config.gradient,
        isActive && "hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={cn("shrink-0 font-medium border", config.color)}
            >
              <span className="mr-1">{config.icon}</span>
              {status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0">
          {/* Prize Section - Prominent */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Prize</span>
              </div>
              <span className="font-mono font-bold text-lg text-primary">{prize}</span>
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline</span>
              </div>
              <span className={cn(
                "font-medium",
                isUrgent && "text-red-600 dark:text-red-400"
              )}>
                {deadline}
                {isUrgent && (
                  <Clock className="inline h-3 w-3 ml-1 text-red-500" />
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submissions</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {submissions} {submissions === 1 ? 'entry' : 'entries'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Creator</span>
              </div>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {creator}
              </span>
            </div>
          </div>
        </CardContent>
        
        {showActions && (
          <CardFooter className="pt-4 border-t">
            <Button 
              variant={isActive ? "default" : "outline"} 
              size="sm" 
              className="w-full group-hover:shadow-md transition-all"
            >
              {isActive ? "Join Task" : "View Details"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}