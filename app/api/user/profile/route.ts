import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DownloadLimitService } from '@/services/downloadLimitService'
import { prisma } from '@/app/db'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get download history
    const downloadHistory = await DownloadLimitService.getDownloadHistory(user.id, 20)
    
    // Get user stats
    const stats = await DownloadLimitService.getUserStats(user.id)
    
    // Get download limits
    const isPro = await DownloadLimitService.hasProAccess(user.id)
    const limits = isPro ? 
      { canDownload: true, remaining: -1, isPro: true } :
      await DownloadLimitService.checkDownloadLimit(user.id)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt
        },
        subscription: {
          tier: user.subscriptions?.tier || 'FREE',
          status: user.subscriptions?.status || 'INACTIVE',
          currentPeriodEnd: user.subscriptions?.currentPeriodEnd
        },
        downloadLimits: limits,
        stats,
        recentDownloads: downloadHistory
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
