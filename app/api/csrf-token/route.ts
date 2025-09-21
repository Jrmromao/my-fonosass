import { CSRFProtection } from '@/lib/security/csrf';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for CSRF token generation
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate CSRF token
    const csrfToken = CSRFProtection.generateToken();

    return NextResponse.json({
      success: true,
      csrfToken,
      message: 'CSRF token generated successfully',
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
