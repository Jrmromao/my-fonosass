import { getDbUserId } from '@/lib/auth/dbUser';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import {
  ConsentPreferences,
  ConsentService,
} from '@/lib/services/consentService';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ marketingCommunications: z.boolean() });

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * Saves the optional-communications choice from the privacy settings.
 * Every other consent keeps its current value (recordConsent rewrites all).
 */
export async function PUT(request: NextRequest) {
  try {
    const security = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: false,
    });
    if (!security.success) return security.response!;

    const { userId } = await auth();
    const dbUserId = userId ? await getDbUserId(userId) : null;
    if (!dbUserId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return NextResponse.json(
        { error: 'Invalid body' },
        { status: 400, headers: NO_STORE }
      );
    }

    const existing = await ConsentService.getUserConsentStatus(dbUserId);
    const granted = (type: string) =>
      existing.some((c) => c.consentType === type && c.granted);

    const preferences: ConsentPreferences = {
      dataProcessing: true,
      cookiesEssential: true,
      marketingCommunications: body.data.marketingCommunications,
      analyticsTracking: granted('ANALYTICS_TRACKING'),
      thirdPartySharing: granted('THIRD_PARTY_SHARING'),
      cookiesAnalytics: granted('COOKIES_ANALYTICS'),
      cookiesFunctional: granted('COOKIES_FUNCTIONAL'),
      cookiesMarketing: granted('COOKIES_MARKETING'),
      profiling: granted('PROFILING'),
      automatedDecisionMaking: granted('AUTOMATED_DECISION_MAKING'),
    };

    await ConsentService.recordConsent({
      userId: dbUserId,
      preferences,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    console.error('Error saving consent preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE }
    );
  }
}
