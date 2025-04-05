"use client"

import React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Plus, Trash2 } from "lucide-react"
import { useTaskForm } from "@/context/task-form"

export default function JudgesStep() {
  const { formData, updateJudge, addJudge, removeJudge, errors, generateStyleCommit } = useTaskForm()

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Judges</h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addJudge}
              className="rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.judges.map((judge, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
              {formData.judges.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeJudge(index)}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor={`judgeName${index}`}>Name</Label>
                <Input
                  id={`judgeName${index}`}
                  placeholder="Enter judge name"
                  value={judge.name}
                  onChange={(e) => updateJudge(index, "name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`judgeStyle${index}`}>Style</Label>
                <Input
                  id={`judgeStyle${index}`}
                  placeholder="Enter judge style"
                  value={judge.style}
                  onChange={(e) => updateJudge(index, "style", e.target.value)}
                />
              </div>
            </div>
          ))}

          {errors.judges && (
            <p className="text-sm text-red-500 mt-1">{errors.judges}</p>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={generateStyleCommit}
            className="w-full"
          >
            Generate Style Commitment
          </Button>

          {formData.styleCommit && (
            <div className="p-4 bg-muted rounded-lg">
              <Label>Style Commitment Hash</Label>
              <p className="font-mono text-xs break-all mt-1">{formData.styleCommit}</p>
            </div>
          )}

          {errors.styleCommit && (
            <p className="text-sm text-red-500 mt-1">{errors.styleCommit}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
