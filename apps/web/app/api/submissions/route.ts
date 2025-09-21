import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const userId = searchParams.get('userId')
    
    const where: Record<string, string> = {}
    if (taskId) where.taskId = taskId
    if (userId) where.userId = userId

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            walletAddress: true
          }
        },
        task: {
          select: {
            title: true,
            amount: true,
            tokenAddress: true,
            deadline: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { taskId, userId, contentHash } = await req.json()
    
    if (!taskId || !userId || !contentHash) {
      return NextResponse.json(
        { error: 'taskId, userId, and contentHash are required' },
        { status: 400 }
      )
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already submitted to this task
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        taskId,
        userId
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'User has already submitted to this task' },
        { status: 400 }
      )
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        taskId,
        userId,
        contentHash,
      },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        },
        task: {
          select: {
            title: true,
            amount: true,
            tokenAddress: true,
          }
        }
      }
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}