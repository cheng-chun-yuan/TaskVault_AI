import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET({ params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: {
        taskId: params.id,
      },
    })
    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}
