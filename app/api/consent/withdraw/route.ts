import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { ConsentService } from '@/lib/services/consentService';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware with CSRF protection
    const securityResult = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: true,
    });

    if (!securityResult.success) {
      return securityResult.response!;
    }

    const { userId } = await auth();

    const body = await request.json();
    const { consentType, reason } = body;

    await ConsentService.withdrawConsent(
      userId!,
      consentType,
      reason || 'Usuário retirou consentimento via painel'
    );

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
