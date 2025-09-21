import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// This endpoint would be called by a Telegram bot monitoring the group
export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { 
      messageContent, 
      telegramUserId, 
      telegramUsername,
      chatId,
      messageId,
      submissionTag 
    } = await request.json()

    if (!messageContent || !submissionTag || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find task by submission tag and chat ID
    const task = await prisma.task.findFirst({
      where: {
        submissionTag,
        telegramChatId: chatId.toString(),
        isActive: true,
        deadline: {
          gte: new Date()
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'No active task found for this submission tag' },
        { status: 404 }
      )
    }

    // For now, we'll create a user based on Telegram info if they don't exist
    // In a real implementation, you'd need a way to link Telegram users to wallet addresses
    let user = await prisma.user.findFirst({
      where: {
        telegramHandle: telegramUsername
      }
    })

    if (!user) {
      // Create a temporary user - in production, you'd need proper user linking
      user = await prisma.user.create({
        data: {
          walletAddress: `telegram_${telegramUserId}`, // Temporary wallet
          telegramHandle: telegramUsername
        }
      })
    }

    // Check if user is participating in the task
    const participation = await prisma.taskParticipation.findUnique({
      where: {
        taskId_userId: {
          taskId: task.taskId,
          userId: user.id
        }
      }
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'User must join the task before submitting' },
        { status: 400 }
      )
    }

    // Check for existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        taskId_userId: {
          taskId: task.taskId,
          userId: user.id
        }
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
        taskId: task.taskId,
        userId: user.id,
        contentHash: `telegram_${chatId}_${messageId}`,
        telegramContent: messageContent,
        status: 'PENDING'
      }
    })

    // Trigger AI judging (this would be async in production)
    await judgeSubmissionWithAI(submission.id, messageContent, task.criteria)

    return NextResponse.json({ 
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        message: 'Submission received and is being processed by AI judge'
      }
    })
  } catch (error) {
    console.error('Error processing Telegram submission:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

// AI judging function
async function judgeSubmissionWithAI(submissionId: string, content: string, criteria: string[]) {
  try {
    if (!prisma) {
      throw new Error('Database not configured')
    }

    // Simulate AI judging (in production, you'd call OpenAI API or similar)
    const aiScore = Math.random() * 100 // Random score for demo
    const isApproved = aiScore >= 70 // Approve if score >= 70
    
    const aiReason = isApproved 
      ? `Submission meets criteria: ${criteria.join(', ')}. Score: ${aiScore.toFixed(1)}/100`
      : `Submission does not adequately meet criteria. Score: ${aiScore.toFixed(1)}/100`

    // Update submission with AI judgment
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: isApproved ? 'APPROVED' : 'REJECTED',
        aiJudgeScore: aiScore,
        aiJudgeReason: aiReason
      },
      include: {
        task: true,
        user: true
      }
    })

    // If approved and instant reward, trigger reward distribution
    if (isApproved && updatedSubmission.task.rewardTiming === 'INSTANT') {
      await distributeReward(updatedSubmission)
    }

    return updatedSubmission
  } catch (error) {
    console.error('Error in AI judging:', error)
  }
}

// Reward distribution function
async function distributeReward(submission: { id: string; user?: { walletAddress: string }; task?: { amount: string } }) {
  try {
    if (!prisma) {
      throw new Error('Database not configured')
    }

    // Simulate reward distribution (in production, you'd interact with smart contracts)
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`
    
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'REWARDED',
        rewardTxHash: txHash
      }
    })

    console.log(`Reward distributed to ${submission.user?.walletAddress}: ${submission.task?.amount} tokens`)
  } catch (error) {
    console.error('Error distributing reward:', error)
  }
}