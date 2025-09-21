import { ConsentService } from '@/lib/services/consentService'
import { auth } from '@clerk/nextjs/server'
import { ConsentMethod } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferences } = body

    await ConsentService.recordConsent({
      userId,
      preferences,
      ipAddress: undefined, // Will be captured server-side
      userAgent: undefined, // Will be captured server-side
      consentMethod: ConsentMethod.GRANULAR
    })
    
    return NextResponse.json({
      success: true,
      message: 'Consent recorded successfully'
    })
  } catch (error) {
    console.error('Error recording consent:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
