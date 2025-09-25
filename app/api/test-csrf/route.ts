import { CSRFProtection } from '@/lib/security/csrf';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test CSRF token generation
    const token = CSRFProtection.generateToken();

    // Test token validation
    const isValid = CSRFProtection.validateToken(token);

    return NextResponse.json({
      success: true,
      token,
      isValid,
      message: 'CSRF token test successful',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
