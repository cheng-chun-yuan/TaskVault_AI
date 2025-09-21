import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { address } = await params
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        createdTasks: {
          select: {
            taskId: true,
            title: true,
            description: true,
            amount: true,
            tokenAddress: true,
            deadline: true,
            createdAt: true,
            taskType: true,
            _count: {
              select: {
                submissions: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        submissions: {
          select: {
            id: true,
            taskId: true,
            contentHash: true,
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
        },
        _count: {
          select: {
            createdTasks: true,
            submissions: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total earned (this would need to be tracked properly with judging results)
    const totalEarned = user.submissions.length * 0.1 // Mock calculation

    const userProfile = {
      ...user,
      displayName: `User_${address.slice(-4)}`,
      isKYCVerified: false,
      verificationLevel: 'none' as const,
      tasksCreated: user._count.createdTasks,
      tasksCompleted: user._count.submissions,
      totalEarned: totalEarned.toString(),
      reputation: Math.min(user._count.submissions * 10 + user._count.createdTasks * 5, 1000),
      emailNotifications: true,
      browserNotifications: true,
      defaultTaskType: 'TWITTER_INTERACT',
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { address } = await params
    await request.json()
    
    // For now, we'll just store preferences in a separate table or extend the user model
    // This is a placeholder for profile updates
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // In a real implementation, you'd update user preferences/profile data
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}