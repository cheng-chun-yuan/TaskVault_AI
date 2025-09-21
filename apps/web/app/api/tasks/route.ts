import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { database } from '@/lib/env'
import type { TaskData } from '@/lib/utils'
import type { TaskType } from '@/types/task-form'
import type { RewardTiming } from '@prisma/client'

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds cache

export async function POST(req: Request) {
  try {
    // Check if database is configured
    if (!database.url || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

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

    // Invalidate cache when new task is created
    cache.clear()

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
    // Check if database is configured
    if (!database.url || !prisma) {
      // Return mock data for development when DB is not configured
      return NextResponse.json({
        tasks: [],
        total: 0,
        hasMore: false
      })
    }

    const { searchParams } = new URL(request.url)
    const taskType = searchParams.get('taskType')
    const creator = searchParams.get('creator')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Create cache key from query parameters
    const cacheKey = `tasks:${searchParams.toString()}`
    const cachedData = cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data)
    }

    // Build where clause
    const where: Record<string, unknown> = {}
    
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
    const orderBy: Record<string, 'asc' | 'desc'> = {}
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
        select: {
          taskId: true,
          title: true,
          description: true,
          criteria: true,
          deadline: true,
          amount: true,
          tokenAddress: true,
          createdAt: true,
          taskType: true,
          telegramChatId: true,
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

    const result = { 
      tasks: transformedTasks,
      total: totalCount,
      hasMore: offset + limit < totalCount
    }

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    // Clean up old cache entries (simple cleanup)
    if (cache.size > 100) {
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key)
        }
      }
    }

    const response = NextResponse.json(result)
    
    // Add cache headers for browser caching
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
