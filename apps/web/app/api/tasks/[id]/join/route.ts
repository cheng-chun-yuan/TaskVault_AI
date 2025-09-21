import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: taskId } = params
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if task exists and is active
    const task = await prisma.task.findUnique({
      where: { taskId },
      include: {
        _count: {
          select: {
            participations: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (!task.isActive) {
      return NextResponse.json(
        { error: 'Task is no longer active' },
        { status: 400 }
      )
    }

    if (task.deadline < new Date()) {
      return NextResponse.json(
        { error: 'Task deadline has passed' },
        { status: 400 }
      )
    }

    // Check participant limit
    if (task.maxParticipants && task._count.participations >= task.maxParticipants) {
      return NextResponse.json(
        { error: 'Task has reached maximum participants' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress }
      })
    }

    // Check if already participating
    const existingParticipation = await prisma.taskParticipation.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: user.id
        }
      }
    })

    if (existingParticipation) {
      return NextResponse.json(
        { message: 'Already participating in this task', participation: existingParticipation }
      )
    }

    // Create participation
    const participation = await prisma.taskParticipation.create({
      data: {
        taskId,
        userId: user.id
      },
      include: {
        task: {
          select: {
            title: true,
            submissionTag: true,
            telegramChatId: true,
            criteria: true,
            rewardTiming: true
          }
        }
      }
    })

    return NextResponse.json({ 
      participation,
      instructions: {
        message: `Successfully joined "${participation.task.title}"!`,
        submissionInstructions: task.submissionTag 
          ? `To submit, post in the Telegram group with the tag: ${task.submissionTag}`
          : 'Submission instructions will be provided by the task creator.',
        criteria: task.criteria,
        rewardTiming: task.rewardTiming === 'INSTANT' 
          ? 'Rewards are distributed instantly after AI approval'
          : 'Rewards are distributed after the task deadline'
      }
    })
  } catch (error) {
    console.error('Error joining task:', error)
    return NextResponse.json(
      { error: 'Failed to join task' },
      { status: 500 }
    )
  }
}