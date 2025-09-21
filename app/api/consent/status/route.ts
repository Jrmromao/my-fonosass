import { ConsentService } from '@/lib/services/consentService'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const consentStatus = await ConsentService.getUserConsentStatus(userId)
    
    return NextResponse.json({
      success: true,
      data: consentStatus
    })
  } catch (error) {
    console.error('Error fetching consent status:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
