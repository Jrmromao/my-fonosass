import { ConsentService } from '@/lib/services/consentService';
import { auth } from '@clerk/nextjs/server';
import { ConsentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { consentType, reason } = body as { 
      consentType: ConsentType; 
      reason?: string; 
    };

    if (!consentType) {
      return NextResponse.json(
        { error: 'Consent type is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Withdraw consent
    const consentRecord = await ConsentService.withdrawConsent(
      userId,
      consentType,
      reason,
      ipAddress,
      userAgent
    );

    if (!consentRecord) {
      return NextResponse.json(
        { error: 'Consent not found or already withdrawn' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully',
      consentRecord
    });

  } catch (error) {
    console.error('Error withdrawing consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
