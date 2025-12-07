import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import {
  ConsentPreferences,
  ConsentService,
} from '@/lib/services/consentService';
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
    const { preferences } = body as { preferences: ConsentPreferences };

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record consent
    const consentRecords = await ConsentService.recordConsent({
      userId: userId!,
      preferences,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Consent preferences saved successfully',
      consentRecords,
    });
  } catch (error) {
    console.error('Error saving consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consentRecords = await ConsentService.getUserConsentStatus(userId);

    return NextResponse.json({
      success: true,
      consentRecords,
    });
  } catch (error) {
    console.error('Error fetching consent status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
