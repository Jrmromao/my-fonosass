import { prisma } from '@/app/db'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body to get confirmation
    const { confirmDeletion, reason } = await request.json()
    
    if (!confirmDeletion) {
      return NextResponse.json({ 
        error: 'Deletion confirmation required',
        message: 'You must confirm the deletion by setting confirmDeletion to true'
      }, { status: 400 })
    }

    // Get user from database first to verify existence
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true,
        downloadHistory: true,
        createdActivities: {
          include: {
            files: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create audit log entry before deletion
    const auditLog = {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      fullName: user.fullName,
      deletionReason: reason || 'User requested data deletion',
      deletedAt: new Date().toISOString(),
      dataDeleted: {
        userProfile: true,
        subscription: !!user.subscriptions,
        downloadHistory: user.downloadHistory.length,
        createdActivities: user.createdActivities.length,
        activityFiles: user.createdActivities.reduce((total, activity) => total + activity.files.length, 0)
      }
    }

    // Log the deletion for audit purposes
    console.log('User data deletion initiated:', auditLog)

    // Start transaction for cascading deletion
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete download history
      await tx.downloadHistory.deleteMany({
        where: { userId: user.id }
      })

      // 2. Delete activity files for user's created activities
      for (const activity of user.createdActivities) {
        await tx.activityFile.deleteMany({
          where: { activityId: activity.id }
        })
      }

      // 3. Delete user's created activities
      await tx.activity.deleteMany({
        where: { createdById: user.id }
      })

      // 4. Delete subscription if exists
      if (user.subscriptions) {
        await tx.subscription.delete({
          where: { userId: user.id }
        })
      }

      // 5. Delete download limits if exists
      await tx.downloadLimit.deleteMany({
        where: { userId: user.id }
      })

      // 6. Finally delete the user
      const deletedUser = await tx.user.delete({
        where: { id: user.id }
      })

      return deletedUser
    })

    // TODO: In a production environment, you would also need to:
    // 1. Delete user from Clerk
    // 2. Delete files from S3
    // 3. Send deletion confirmation email
    // 4. Update external systems
    // 5. Store audit log in secure location

    return NextResponse.json({
      success: true,
      message: 'User data successfully deleted',
      data: {
        deletedUserId: result.id,
        deletedAt: new Date().toISOString(),
        auditLog: auditLog
      }
    })

  } catch (error) {
    console.error('Error deleting user data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to delete user data'
    }, { status: 500 })
  }
}

// GET endpoint to show what data would be deleted (preview)
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data summary for preview
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true,
        downloadHistory: true,
        createdActivities: {
          include: {
            files: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate data summary
    const dataSummary = {
      userProfile: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      },
      subscription: user.subscriptions ? {
        tier: user.subscriptions.tier,
        status: user.subscriptions.status,
        currentPeriodEnd: user.subscriptions.currentPeriodEnd
      } : null,
      downloadHistory: {
        count: user.downloadHistory.length,
        totalSize: user.downloadHistory.reduce((sum, download) => sum + (download.fileSize || 0), 0)
      },
      createdActivities: {
        count: user.createdActivities.length,
        totalFiles: user.createdActivities.reduce((total, activity) => total + activity.files.length, 0)
      },
      warning: 'This action cannot be undone. All your data will be permanently deleted.'
    }

    return NextResponse.json({
      success: true,
      data: dataSummary
    })

  } catch (error) {
    console.error('Error getting deletion preview:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to get deletion preview'
    }, { status: 500 })
  }
}
