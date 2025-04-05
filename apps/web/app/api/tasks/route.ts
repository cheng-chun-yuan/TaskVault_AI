import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { TaskData } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const data: TaskData = await req.json()
    
    const task = await prisma.task.create({
      data: {
        ...data,
        styleCommit: data.styleCommit!,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tasks = await prisma.task.findMany()
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
