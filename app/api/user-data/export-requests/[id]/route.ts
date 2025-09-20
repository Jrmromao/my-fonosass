import { prisma } from '@/app/db'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// In-memory store for export requests (in production, use a database)
const exportRequests = new Map<string, any>()

// GET specific export request by ID
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: requestId } = await params
    const exportRequest = exportRequests.get(requestId)

    if (!exportRequest) {
      return NextResponse.json({ error: 'Export request not found' }, { status: 404 })
    }

    // Check if user owns this request
    if (exportRequest.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to export request' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: exportRequest
    })

  } catch (error) {
    console.error('Error retrieving export request:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve export request'
    }, { status: 500 })
  }
}

// PUT endpoint to update export request status (admin only)
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id: requestId } = await params
    const exportRequest = exportRequests.get(requestId)

    if (!exportRequest) {
      return NextResponse.json({ error: 'Export request not found' }, { status: 404 })
    }

    // Parse update data
    const { status, downloadUrl, error: errorMessage } = await request.json()

    // Update the request
    const updatedRequest = {
      ...exportRequest,
      status: status || exportRequest.status,
      downloadUrl: downloadUrl || exportRequest.downloadUrl,
      error: errorMessage || null,
      updatedAt: new Date().toISOString()
    }

    exportRequests.set(requestId, updatedRequest)

    return NextResponse.json({
      success: true,
      message: 'Export request updated successfully',
      data: updatedRequest
    })

  } catch (error) {
    console.error('Error updating export request:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to update export request'
    }, { status: 500 })
  }
}
