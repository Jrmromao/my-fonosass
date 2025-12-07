import { ConsentService } from '@/lib/services/consentService';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const auditTrail = await ConsentService.getConsentAuditTrail(userId);

    return NextResponse.json({
      success: true,
      auditTrail
    });

  } catch (error) {
    console.error('Error fetching consent audit trail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
