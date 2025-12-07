import { CSRFProtection } from '@/lib/security/csrf';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, let's make CSRF token generation work without authentication
    // to debug the issue. We can add auth back later.
    const { userId } = await auth();

    // Generate CSRF token
    const csrfToken = CSRFProtection.generateToken();

    if (!csrfToken) {
      return NextResponse.json(
        { error: 'Failed to generate CSRF token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      csrfToken,
      message: 'CSRF token generated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
