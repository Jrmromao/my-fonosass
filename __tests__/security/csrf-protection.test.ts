//@ts-ignore
import { CSRFProtection, validateCSRF } from '@/lib/security/csrf';

// Mock NextRequest for testing
class MockNextRequest {
  private headers: Map<string, string>;

  constructor(
    url: string,
    init?: { method?: string; headers?: Record<string, string> }
  ) {
    this.headers = new Map();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(key: string) {
    return this.headers.get(key.toLowerCase()) || null;
  }
}

describe('CSRF Protection', () => {
  describe('CSRFProtection', () => {
    test('should generate valid CSRF token', () => {
      const token = CSRFProtection.generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should validate correct CSRF token', () => {
      const token = CSRFProtection.generateToken();
      const isValid = CSRFProtection.validateToken(token);
      expect(isValid).toBe(true);
    });

    test('should reject invalid CSRF token', () => {
      const invalidToken = 'invalid-token';
      const isValid = CSRFProtection.validateToken(invalidToken);
      expect(isValid).toBe(false);
    });

    test('should reject expired CSRF token', () => {
      // Create a token with old timestamp
      const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      const randomValue = 'test123';
      const data = `${randomValue}:${oldTimestamp}`;
      const signature = 'fake-signature';
      const expiredToken = Buffer.from(`${data}:${signature}`).toString(
        'base64'
      );

      const isValid = CSRFProtection.validateToken(expiredToken);
      expect(isValid).toBe(false);
    });

    test('should extract token from request headers', () => {
      const token = CSRFProtection.generateToken();
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          'content-type': 'application/json',
        },
      }) as any;

      const extractedToken = CSRFProtection.getTokenFromRequest(request);
      expect(extractedToken).toBe(token);
    });

    test('should return null when no token in headers', () => {
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      }) as any;

      const extractedToken = CSRFProtection.getTokenFromRequest(request);
      expect(extractedToken).toBeNull();
    });
  });

  describe('validateCSRF', () => {
    test('should validate CSRF token from request', () => {
      const token = CSRFProtection.generateToken();
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          'content-type': 'application/json',
        },
      }) as any;

      const isValid = validateCSRF(request);
      expect(isValid).toBe(true);
    });

    test('should reject request without CSRF token', () => {
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      }) as any;

      const isValid = validateCSRF(request);
      expect(isValid).toBe(false);
    });

    test('should reject request with invalid CSRF token', () => {
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'invalid-token',
          'content-type': 'application/json',
        },
      }) as any;

      const isValid = validateCSRF(request);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Security', () => {
    test('should generate unique tokens', () => {
      const token1 = CSRFProtection.generateToken();
      const token2 = CSRFProtection.generateToken();
      expect(token1).not.toBe(token2);
    });

    test('should have proper token structure', () => {
      const token = CSRFProtection.generateToken();
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      expect(parts).toHaveLength(3); // randomValue:timestamp:signature
    });

    test('should include timestamp in token', () => {
      const token = CSRFProtection.generateToken();
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [randomValue, timestamp, signature] = decoded.split(':');

      expect(timestamp).toBeDefined();
      expect(Number.isInteger(parseInt(timestamp))).toBe(true);
      expect(parseInt(timestamp)).toBeGreaterThan(0);
    });
  });
});
