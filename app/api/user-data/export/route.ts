import { prisma } from '@/app/db'
import { DownloadLimitService } from '@/services/downloadLimitService'
import { auth } from '@clerk/nextjs/server'
import { parse } from 'json2csv'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true,
        createdActivities: true,
        downloadHistory: {
          include: {
            activity: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const downloadStats = await DownloadLimitService.getUserStats(user.id)
    const downloadLimits = await DownloadLimitService.checkDownloadLimit(user.id)

    const data = {
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      subscription: user.subscriptions ? {
        id: user.subscriptions.id,
        tier: user.subscriptions.tier,
        status: user.subscriptions.status,
        paymentId: user.subscriptions.paymentId,
        currentPeriodStart: user.subscriptions.currentPeriodStart.toISOString(),
        currentPeriodEnd: user.subscriptions.currentPeriodEnd?.toISOString() || null,
        createdAt: user.subscriptions.createdAt.toISOString(),
        updatedAt: user.subscriptions.updatedAt.toISOString()
      } : null,
      downloadHistory: user.downloadHistory.map(download => ({
        id: download.id,
        fileName: download.fileName,
        fileSize: download.fileSize,
        downloadedAt: download.downloadedAt.toISOString(),
        ipAddress: download.ipAddress,
        userAgent: download.userAgent,
        activity: {
          id: download.activity.id,
          name: download.activity.name,
          type: download.activity.type,
          phoneme: download.activity.phoneme,
          difficulty: download.activity.difficulty,
          ageRange: download.activity.ageRange
        }
      })),
      downloadStats: {
        totalDownloads: downloadStats.totalDownloads,
        uniqueActivities: downloadStats.uniqueActivities,
        recentDownloads: downloadStats.recentDownloads,
        remainingDownloads: downloadLimits.remaining,
        canDownload: downloadLimits.canDownload
      },
      createdActivities: user.createdActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        type: activity.type,
        difficulty: activity.difficulty,
        phoneme: activity.phoneme,
        ageRange: activity.ageRange,
        isPublic: activity.isPublic,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString()
      }))
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    if (format === 'csv') {
      const fields = [
        'category', 'field', 'value', 'type', 'lastUpdatedAt'
      ]
      const rows: any[] = []

      // User data
      rows.push(['User', 'ID', data.user.id, 'String', data.user.updatedAt])
      rows.push(['User', 'Clerk User ID', data.user.clerkUserId, 'String', data.user.updatedAt])
      rows.push(['User', 'Email', data.user.email, 'String', data.user.updatedAt])
      rows.push(['User', 'Full Name', data.user.fullName, 'String', data.user.updatedAt])
      rows.push(['User', 'Role', data.user.role, 'String', data.user.updatedAt])
      rows.push(['User', 'Created At', data.user.createdAt, 'DateTime', data.user.updatedAt])

      // Subscription data
      if (data.subscription) {
        rows.push(['Subscription', 'ID', data.subscription.id, 'String', data.subscription.updatedAt])
        rows.push(['Subscription', 'Tier', data.subscription.tier, 'String', data.subscription.updatedAt])
        rows.push(['Subscription', 'Status', data.subscription.status, 'String', data.subscription.updatedAt])
        rows.push(['Subscription', 'Current Period End', data.subscription.currentPeriodEnd, 'DateTime', data.subscription.updatedAt])
      }

      // Add download statistics
      rows.push(['Download Stats', 'Total Downloads', data.downloadStats.totalDownloads.toString(), 'Number', new Date().toISOString()])
      rows.push(['Download Stats', 'Unique Activities', data.downloadStats.uniqueActivities.toString(), 'Number', new Date().toISOString()])
      rows.push(['Download Stats', 'Recent Downloads', data.downloadStats.recentDownloads.toString(), 'Number', new Date().toISOString()])
      rows.push(['Download Stats', 'Remaining Downloads', data.downloadStats.remainingDownloads.toString(), 'Number', new Date().toISOString()])

      // Add download history
      data.downloadHistory.forEach((download: any, index: number) => {
        rows.push([`Download History ${index + 1}`, 'File Name', download.fileName, 'String', download.downloadedAt])
        rows.push([`Download History ${index + 1}`, 'Downloaded At', download.downloadedAt, 'DateTime', download.downloadedAt])
        rows.push([`Download History ${index + 1}`, 'Activity Name', download.activity.name, 'String', download.downloadedAt])
      })

      // Add created activities
      data.createdActivities.forEach((activity: any, index: number) => {
        rows.push([`Created Activity ${index + 1}`, 'Name', activity.name, 'String', activity.updatedAt])
        rows.push([`Created Activity ${index + 1}`, 'Description', activity.description, 'String', activity.updatedAt])
        rows.push([`Created Activity ${index + 1}`, 'Type', activity.type, 'String', activity.updatedAt])
      })

      const csv = parse(rows, { fields })
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user_data_export_${clerkUserId}.csv"`,
        },
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true,
        downloadHistory: {
          include: {
            activity: true
          },
          orderBy: {
            downloadedAt: 'desc'
          }
        },
        createdActivities: {
          include: {
            files: true,
            categories: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body to get export format
    const { format = 'json' } = await request.json()

    // Get additional user data
    const downloadStats = await DownloadLimitService.getUserStats(user.id)
    const downloadLimits = await DownloadLimitService.checkDownloadLimit(user.id)

    // Prepare comprehensive user data export
    const exportData = {
      // Basic user information
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      
      // Subscription information
      subscription: user.subscriptions ? {
        id: user.subscriptions.id,
        tier: user.subscriptions.tier,
        status: user.subscriptions.status,
        paymentId: user.subscriptions.paymentId,
        currentPeriodStart: user.subscriptions.currentPeriodStart,
        currentPeriodEnd: user.subscriptions.currentPeriodEnd,
        createdAt: user.subscriptions.createdAt,
        updatedAt: user.subscriptions.updatedAt
      } : null,
      
      // Download history and statistics
      downloadHistory: user.downloadHistory.map(download => ({
        id: download.id,
        fileName: download.fileName,
        fileSize: download.fileSize,
        downloadedAt: download.downloadedAt,
        ipAddress: download.ipAddress,
        userAgent: download.userAgent,
        activity: {
          id: download.activity.id,
          name: download.activity.name,
          type: download.activity.type,
          difficulty: download.activity.difficulty,
          phoneme: download.activity.phoneme,
          ageRange: download.activity.ageRange
        }
      })),
      
      // Download statistics
      downloadStats: {
        totalDownloads: downloadStats.totalDownloads,
        uniqueActivities: downloadStats.uniqueActivities,
        recentDownloads: downloadStats.recentDownloads,
        remainingDownloads: downloadLimits.remaining,
        canDownload: downloadLimits.canDownload
      },
      
      // Created activities
      createdActivities: user.createdActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        type: activity.type,
        difficulty: activity.difficulty,
        phoneme: activity.phoneme,
        ageRange: activity.ageRange,
        isPublic: activity.isPublic,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        files: activity.files.map(file => ({
          id: file.id,
          name: file.name,
          fileType: file.fileType,
          sizeInBytes: file.sizeInBytes,
          createdAt: file.createdAt
        })),
        categories: activity.categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description
        }))
      })),
      
      // Export metadata
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        format: format,
        version: '1.0',
        dataRetentionPolicy: 'This data export contains all personal data associated with your account as required by LGPD (Lei Geral de Proteção de Dados).'
      }
    }

    // Generate export based on requested format
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return JSON for now and implement PDF generation later
      return NextResponse.json({
        success: true,
        message: 'PDF export not yet implemented. Please use JSON or CSV format.',
        data: exportData
      })
    } else {
      // Default to JSON
      return NextResponse.json({
        success: true,
        data: exportData
      })
    }

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to export user data'
    }, { status: 500 })
  }
}

// Helper function to convert data to CSV format
function convertToCSV(data: any): string {
  const headers = [
    'Field',
    'Value',
    'Type',
    'Last Updated'
  ]
  
  const rows: string[][] = []
  
  // Add user basic info
  rows.push(['User ID', data.user.id, 'String', data.user.updatedAt])
  rows.push(['Email', data.user.email, 'String', data.user.updatedAt])
  rows.push(['Full Name', data.user.fullName, 'String', data.user.updatedAt])
  rows.push(['Role', data.user.role, 'String', data.user.updatedAt])
  rows.push(['Created At', data.user.createdAt, 'DateTime', data.user.createdAt])
  
  // Add subscription info
  if (data.subscription) {
    rows.push(['Subscription Tier', data.subscription.tier, 'String', data.subscription.updatedAt])
    rows.push(['Subscription Status', data.subscription.status, 'String', data.subscription.updatedAt])
    rows.push(['Current Period End', data.subscription.currentPeriodEnd, 'DateTime', data.subscription.updatedAt])
  }
  
  // Add download statistics
  rows.push(['Total Downloads', data.downloadStats.totalDownloads.toString(), 'Number', new Date().toISOString()])
  rows.push(['Unique Activities', data.downloadStats.uniqueActivities.toString(), 'Number', new Date().toISOString()])
  rows.push(['Recent Downloads', data.downloadStats.recentDownloads.toString(), 'Number', new Date().toISOString()])
  rows.push(['Remaining Downloads', data.downloadStats.remainingDownloads.toString(), 'Number', new Date().toISOString()])
  
  // Add download history
  data.downloadHistory.forEach((download: any, index: number) => {
    rows.push([`Download ${index + 1} - File`, download.fileName, 'String', download.downloadedAt])
    rows.push([`Download ${index + 1} - Date`, download.downloadedAt, 'DateTime', download.downloadedAt])
    rows.push([`Download ${index + 1} - Activity`, download.activity.name, 'String', download.downloadedAt])
  })
  
  // Add created activities
  data.createdActivities.forEach((activity: any, index: number) => {
    rows.push([`Activity ${index + 1} - Name`, activity.name, 'String', activity.updatedAt])
    rows.push([`Activity ${index + 1} - Type`, activity.type, 'String', activity.updatedAt])
    rows.push([`Activity ${index + 1} - Difficulty`, activity.difficulty, 'String', activity.updatedAt])
    rows.push([`Activity ${index + 1} - Created`, activity.createdAt, 'DateTime', activity.createdAt])
  })
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n')
  
  return csvContent
}
