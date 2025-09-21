import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { TaskData } from '@/lib/utils'
import type { TaskType } from '@/types/task-form'
import type { RewardTiming } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const data: TaskData = await req.json()
    
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        criteria: data.criteria,
        deadline: data.deadline,
        tokenAddress: data.tokenAddress,
        amount: data.amount,
        styleCommit: data.styleCommit!,
        createdBy: data.createdBy,
        taskType: (data.taskType || 'TELEGRAM_GROUP') as TaskType,
        telegramChatId: data.telegramChatId,
        submissionTag: data.submissionTag,
        rewardTiming: (data.rewardTiming || 'INSTANT') as RewardTiming,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const taskType = searchParams.get('taskType')
    const creator = searchParams.get('creator')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (taskType) {
      where.taskType = taskType
    }
    
    if (creator) {
      where.createdBy = creator
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    switch (sortBy) {
      case 'deadline':
        orderBy.deadline = order
        break
      case 'amount':
        orderBy.amount = order
        break
      case 'createdAt':
      default:
        orderBy.createdAt = order
        break
    }

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          creator: {
            select: {
              walletAddress: true
            }
          },
          _count: {
            select: {
              submissions: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.task.count({ where })
    ])

    // Transform tasks to include computed status and submission count
    const transformedTasks = tasks.map(task => {
      const now = new Date()
      let computedStatus = 'Open'
      
      if (task.deadline < now) {
        computedStatus = 'Closed'
      }
      // Add more status logic based on your business rules
      
      return {
        id: task.taskId,
        title: task.title,
        description: task.description,
        criteria: task.criteria,
        deadline: task.deadline,
        prize: task.amount,
        tokenAddress: task.tokenAddress,
        status: computedStatus,
        submissions: task._count.submissions,
        creator: task.creator.walletAddress,
        createdAt: task.createdAt,
        taskType: task.taskType,
        telegramChatId: task.telegramChatId,
        excludedCountries: [], // Add to schema if needed
        ofacRequired: true, // Add to schema if needed
      }
    })

    return NextResponse.json({ 
      tasks: transformedTasks,
      total: totalCount,
      hasMore: offset + limit < totalCount
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
