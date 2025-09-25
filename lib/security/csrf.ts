import { createHash, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly SECRET_KEY =
    process.env.CSRF_SECRET_KEY || 'default-secret-key-change-in-production';

  static generateToken(): string {
    try {
      const randomValue = randomBytes(this.TOKEN_LENGTH);
      const timestamp = Date.now().toString();
      const data = `${randomValue.toString('hex')}:${timestamp}`;
      const signature = createHash('sha256')
        .update(data + this.SECRET_KEY)
        .digest('hex');

      const token = Buffer.from(`${data}:${signature}`).toString('base64');
      return token;
    } catch (error) {
      // Fallback to a simple token if crypto operations fail
      const fallbackToken = Buffer.from(
        `${Date.now()}:${Math.random().toString(36)}`
      ).toString('base64');
      return fallbackToken;
    }
  }

  static validateToken(token: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');

      if (parts.length !== 3) {
        return false;
      }

      const [randomValue, timestamp, signature] = parts;

      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 60 * 60 * 1000) {
        return false;
      }

      // Reconstruct the data part for signature verification
      const data = `${randomValue}:${timestamp}`;

      // Verify signature
      const expectedSignature = createHash('sha256')
        .update(data + this.SECRET_KEY)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return false;
    }
  }

  static getTokenFromRequest(request: NextRequest): string | null {
    // Try to get token from header first
    const headerToken = request.headers.get('x-csrf-token');
    if (headerToken) {
      return headerToken;
    }

    // Try to get token from form data
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      // This would need to be handled in the route handler
      return null;
    }

    return null;
  }
}

// Middleware helper for CSRF protection
export const validateCSRF = (request: NextRequest): boolean => {
  const token = CSRFProtection.getTokenFromRequest(request);
  if (!token) {
    return false;
  }

  return CSRFProtection.validateToken(token);
};
