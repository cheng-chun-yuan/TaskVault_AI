import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const users = await prisma!.user.findMany({
      include: {
        createdTasks: {
          select: {
            taskId: true,
            title: true,
            amount: true,
            createdAt: true,
          }
        },
        submissions: {
          select: {
            id: true,
            taskId: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            createdTasks: true,
            submissions: true,
          }
        }
      }
    })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    const { walletAddress } = await req.json()
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma!.user.findUnique({
      where: { walletAddress }
    })

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const user = await prisma!.user.create({
      data: {
        walletAddress,
      },
      include: {
        _count: {
          select: {
            createdTasks: true,
            submissions: true,
          }
        }
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}