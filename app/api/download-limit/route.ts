import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DownloadLimitService } from '@/services/downloadLimitService'
import { prisma } from '@/app/db'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isPro = await DownloadLimitService.hasProAccess(userId)
    
    if (isPro) {
      return NextResponse.json({
        success: true,
        data: {
          canDownload: true,
          remaining: -1, // Unlimited
          isPro: true
        }
      })
    }

    const limit = await DownloadLimitService.checkDownloadLimit(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        ...limit,
        isPro: false
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isPro = await DownloadLimitService.hasProAccess(user.id)
    
    // Get request body for download details
    const body = await request.json()
    const { activityId, fileName, fileSize } = body

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (isPro) {
      // Record download for Pro users too (for history tracking)
      await DownloadLimitService.recordDownload(
        user.id,
        activityId,
        fileName,
        fileSize,
        ipAddress,
        userAgent,
        true // Skip limit increment for Pro users
      )
      
      return NextResponse.json({
        success: true,
        data: { downloaded: true, isPro: true }
      })
    }

    const limit = await DownloadLimitService.checkDownloadLimit(user.id)
    
    if (!limit.canDownload) {
      return NextResponse.json({
        success: false,
        error: 'Download limit reached. Upgrade to Pro for unlimited downloads.'
      }, { status: 403 })
    }

    await DownloadLimitService.recordDownload(
      user.id,
      activityId,
      fileName,
      fileSize,
      ipAddress,
      userAgent
    )
    
    return NextResponse.json({
      success: true,
      data: { downloaded: true, remaining: limit.remaining - 1 }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
