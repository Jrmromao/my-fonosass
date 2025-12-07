import { prisma } from '@/app/db'

const FREE_DOWNLOAD_LIMIT = 5
const RESET_PERIOD_DAYS = 30

export class DownloadLimitService {
  static async checkDownloadLimit(userId: string): Promise<{ canDownload: boolean; remaining: number }> {
    const limit = await prisma.downloadLimit.findUnique({
      where: { userId }
    })

    if (!limit) {
      // Create new limit record
      await prisma.downloadLimit.create({
        data: { userId, downloads: 0 }
      })
      return { canDownload: true, remaining: FREE_DOWNLOAD_LIMIT }
    }

    // Check if reset period has passed
    const now = new Date()
    const daysSinceReset = Math.floor((now.getTime() - limit.resetDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceReset >= RESET_PERIOD_DAYS) {
      // Reset downloads
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 0, resetDate: now }
      })
      return { canDownload: true, remaining: FREE_DOWNLOAD_LIMIT }
    }

    const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - limit.downloads)
    return { canDownload: remaining > 0, remaining }
  }

  static async recordDownload(
    userId: string, 
    activityId: string, 
    fileName: string, 
    fileSize?: number,
    ipAddress?: string,
    userAgent?: string,
    skipLimitIncrement = false
  ): Promise<void> {
    // Always record in download history for tracking
    await prisma.downloadHistory.create({
      data: {
        userId,
        activityId,
        fileName,
        fileSize,
        ipAddress,
        userAgent
      }
    })

    // Only update download limit counter for free users
    if (!skipLimitIncrement) {
      const updatedLimit = await prisma.downloadLimit.upsert({
        where: { userId },
        update: { downloads: { increment: 1 } },
        create: { userId, downloads: 1 }
      })

      // Get user info for email notifications
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true }
      })

      if (user) {
        const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - updatedLimit.downloads)
        
        // Send email notifications based on remaining downloads
        if (remaining === 1) {
          // Last download warning
          const { EmailService } = await import('./emailService')
          await EmailService.sendDownloadLimitWarning(user.email, user.fullName, remaining)
        } else if (remaining === 0) {
          // Limit reached
          const { EmailService } = await import('./emailService')
          await EmailService.sendDownloadLimitReached(user.email, user.fullName)
        }
      }
    }
  }

  static async getDownloadHistory(userId: string, limit = 50) {
    return await prisma.downloadHistory.findMany({
      where: { userId },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
            type: true,
            phoneme: true,
            difficulty: true
          }
        }
      },
      orderBy: { downloadedAt: 'desc' },
      take: limit
    })
  }

  static async getFileDownloadCount(activityId: string, fileName: string): Promise<number> {
    return await prisma.downloadHistory.count({
      where: {
        activityId,
        fileName
      }
    })
  }

  static async getPopularFiles(limit = 10) {
    const result = await prisma.downloadHistory.groupBy({
      by: ['activityId', 'fileName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    })

    // Get activity details for each popular file
    const popularFiles = await Promise.all(
      result.map(async (item) => {
        const activity = await prisma.activity.findUnique({
          where: { id: item.activityId },
          select: {
            id: true,
            name: true,
            type: true,
            phoneme: true,
            difficulty: true
          }
        })

        return {
          activity,
          fileName: item.fileName,
          downloadCount: item._count.id
        }
      })
    )

    return popularFiles
  }

  static async getUserStats(userId: string) {
    const totalDownloads = await prisma.downloadHistory.count({
      where: { userId }
    })

    const uniqueActivities = await prisma.downloadHistory.findMany({
      where: { userId },
      select: { activityId: true },
      distinct: ['activityId']
    })

    const recentDownloads = await prisma.downloadHistory.findMany({
      where: { 
        userId,
        downloadedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    return {
      totalDownloads,
      uniqueActivities: uniqueActivities.length,
      recentDownloads: recentDownloads.length
    }
  }

  static async hasProAccess(userId: string): Promise<boolean> {
    // Check if user has active subscription using existing subscription model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true
      }
    })
    
    return user?.subscriptions?.status === 'ACTIVE' && user?.subscriptions?.tier === 'PRO'
  }
}
