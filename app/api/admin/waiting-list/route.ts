import { NextRequest, NextResponse } from 'next/server'
import { waitingListManager } from '@/lib/waiting-list-utils'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Add role-based access control here
    // For now, we'll allow any authenticated user to view the data
    // In production, you should check if the user has admin privileges

    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const format = url.searchParams.get('format') || 'json'

    let data: any

    if (format === 'csv') {
      const csvData = await waitingListManager.exportAsCSV(date || undefined)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="waiting-list-${date || 'all'}.csv"`
        }
      })
    } else if (format === 'stats') {
      data = await waitingListManager.getStatistics()
    } else {
      data = date 
        ? await waitingListManager.getEntriesForDate(date)
        : await waitingListManager.getAllEntries()
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching waiting list data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
