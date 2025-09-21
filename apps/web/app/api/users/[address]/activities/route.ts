import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's activities from tasks and submissions
    const [createdTasks, submissions] = await Promise.all([
      prisma.task.findMany({
        where: { createdBy: address },
        select: {
          taskId: true,
          title: true,
          amount: true,
          tokenAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.submission.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          taskId: true,
          createdAt: true,
          task: {
            select: {
              title: true,
              amount: true,
              tokenAddress: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Combine and format activities
    const activities = [
      ...createdTasks.map(task => ({
        id: `task_${task.taskId}`,
        type: 'task_created' as const,
        title: `Created "${task.title}"`,
        description: `Created a new task with ${task.amount} ${task.tokenAddress} prize`,
        timestamp: task.createdAt,
        amount: task.amount,
        taskId: task.taskId,
      })),
      ...submissions.map(submission => ({
        id: `submission_${submission.id}`,
        type: 'submission_made' as const,
        title: `Submitted to "${submission.task.title}"`,
        description: `Made a submission to task "${submission.task.title}"`,
        timestamp: submission.createdAt,
        taskId: submission.taskId,
      }))
    ]

    // Sort by timestamp and apply pagination
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit)

    return NextResponse.json({ 
      activities: sortedActivities,
      total: activities.length,
      hasMore: offset + limit < activities.length
    })
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user activities' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params
    const { type, title, description, amount, taskId } = await request.json()
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For now, we'll just return success since activities are derived from tasks/submissions
    // In a full implementation, you might have a separate activities table
    const activity = {
      id: `custom_${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date(),
      amount,
      taskId,
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error adding user activity:', error)
    return NextResponse.json(
      { error: 'Failed to add user activity' },
      { status: 500 }
    )
  }
}