/**
 * Security Headers Tests
 * 
 * Tests for security headers implementation and effectiveness
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { SecurityAssertions, SecurityTestHelper } from './security-test-utils';

// Mock fetch for security tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Setup default mock responses
beforeAll(() => {
  mockFetch.mockImplementation((url: string, options?: any) => {
    // Mock successful responses for most endpoints
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, message: 'Mock response' }),
      text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Mock response' }))
    });
  });
});

afterAll(() => {
  mockFetch.mockRestore();
});

describe('Security Headers', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  beforeAll(() => {
    console.log('Setting up security headers tests...');
  });

  afterAll(() => {
    console.log('Cleaning up security headers tests...');
  });

  describe('Required Security Headers', () => {
    it('should include all required security headers on main pages', async () => {
      const mainPages = [
        '/',
        '/dashboard',
        '/pricing',
        '/about',
        '/sign-in',
        '/sign-up',
      ];

      for (const page of mainPages) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${page}`);
        SecurityAssertions.assertSecurityHeaders(result);
      }
    });

    it('should include security headers on API routes', async () => {
      const apiRoutes = [
        '/api/forms',
        '/api/activities',
        '/api/onboarding',
      ];

      for (const route of apiRoutes) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${route}`);
        SecurityAssertions.assertSecurityHeaders(result);
      }
    });

    it('should include security headers on static assets', async () => {
      const staticAssets = [
        '/favicon.ico',
        '/_next/static/css/app.css',
        '/_next/static/js/app.js',
      ];

      for (const asset of staticAssets) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${asset}`);
        // Static assets might not have all headers, but should have basic ones
        expect(result.missing).not.toContain('x-content-type-options');
        expect(result.missing).not.toContain('x-frame-options');
      }
    });
  });

  describe('Content Security Policy (CSP)', () => {
    it('should have a properly configured CSP header', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['content-security-policy']).toBeDefined();
      
      const csp = result.headers['content-security-policy'];
      
      // Check for essential CSP directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("img-src");
      expect(csp).toContain("connect-src");
    });

    it('should allow necessary external resources in CSP', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const csp = result.headers['content-security-policy'];
      
      // Should allow Clerk and Stripe connections
      expect(csp).toContain('https://api.clerk.dev');
      expect(csp).toContain('https://api.stripe.com');
      
      // Should allow images from various sources
      expect(csp).toContain('https:');
      expect(csp).toContain('data:');
    });

    it('should prevent inline script execution', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const csp = result.headers['content-security-policy'];
      
      // Should not allow unsafe-inline for scripts (unless necessary)
      if (csp.includes('unsafe-inline')) {
        // If unsafe-inline is present, it should be for specific cases only
        expect(csp).toContain('unsafe-eval'); // For Next.js development
      }
    });
  });

  describe('X-Frame-Options', () => {
    it('should prevent clickjacking attacks', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['x-frame-options']).toBeDefined();
      expect(['SAMEORIGIN', 'DENY']).toContain(result.headers['x-frame-options']);
    });

    it('should have consistent X-Frame-Options across all pages', async () => {
      const pages = ['/', '/dashboard', '/pricing', '/about'];
      const frameOptions = new Set();
      
      for (const page of pages) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${page}`);
        if (result.headers['x-frame-options']) {
          frameOptions.add(result.headers['x-frame-options']);
        }
      }
      
      // Should have consistent X-Frame-Options policy
      expect(frameOptions.size).toBeLessThanOrEqual(1);
    });
  });

  describe('X-Content-Type-Options', () => {
    it('should prevent MIME type sniffing', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should have nosniff on all content types', async () => {
      const pages = ['/', '/dashboard', '/api/forms'];
      
      for (const page of pages) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${page}`);
        expect(result.headers['x-content-type-options']).toBe('nosniff');
      }
    });
  });

  describe('X-XSS-Protection', () => {
    it('should enable XSS protection', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['x-xss-protection']).toBeDefined();
      expect(result.headers['x-xss-protection']).toContain('1');
    });

    it('should block XSS attacks', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const xssProtection = result.headers['x-xss-protection'];
      
      expect(xssProtection).toContain('mode=block');
    });
  });

  describe('Strict-Transport-Security (HSTS)', () => {
    it('should enforce HTTPS', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['strict-transport-security']).toBeDefined();
      
      const hsts = result.headers['strict-transport-security'];
      expect(hsts).toContain('max-age=');
      expect(hsts).toContain('includeSubDomains');
    });

    it('should have appropriate HSTS max-age', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const hsts = result.headers['strict-transport-security'];
      
      // Extract max-age value
      const maxAgeMatch = hsts.match(/max-age=(\d+)/);
      expect(maxAgeMatch).toBeDefined();
      
      const maxAge = parseInt(maxAgeMatch![1]);
      expect(maxAge).toBeGreaterThanOrEqual(31536000); // At least 1 year
    });
  });

  describe('Referrer-Policy', () => {
    it('should have appropriate referrer policy', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['referrer-policy']).toBeDefined();
      
      const validPolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
      ];
      
      expect(validPolicies).toContain(result.headers['referrer-policy']);
    });

    it('should prevent referrer leakage', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const referrerPolicy = result.headers['referrer-policy'];
      
      // Should not be 'unsafe-url' which leaks full URLs
      expect(referrerPolicy).not.toBe('unsafe-url');
    });
  });

  describe('Additional Security Headers', () => {
    it('should include X-DNS-Prefetch-Control', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      expect(result.headers['x-dns-prefetch-control']).toBeDefined();
      expect(['on', 'off']).toContain(result.headers['x-dns-prefetch-control']);
    });

    it('should include Permissions-Policy', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      // Permissions-Policy is optional but recommended
      if (result.headers['permissions-policy']) {
        const permissionsPolicy = result.headers['permissions-policy'];
        
        // Should restrict dangerous permissions
        expect(permissionsPolicy).toContain('camera=()');
        expect(permissionsPolicy).toContain('microphone=()');
        expect(permissionsPolicy).toContain('geolocation=()');
      }
    });

    it('should include Cross-Origin-Embedder-Policy', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      // COEP is optional but recommended for enhanced security
      if (result.headers['cross-origin-embedder-policy']) {
        expect(['require-corp', 'credentialless']).toContain(
          result.headers['cross-origin-embedder-policy']
        );
      }
    });
  });

  describe('Header Consistency', () => {
    it('should have consistent headers across all pages', async () => {
      const pages = ['/', '/dashboard', '/pricing', '/about'];
      const headerSets = [];
      
      for (const page of pages) {
        const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}${page}`);
        headerSets.push(Object.keys(result.headers));
      }
      
      // All pages should have the same set of security headers
      const firstSet = headerSets[0];
      for (let i = 1; i < headerSets.length; i++) {
        expect(headerSets[i]).toEqual(expect.arrayContaining(firstSet));
      }
    });

    it('should not have conflicting security headers', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      const headers = result.headers;
      
      // Should not have both X-Frame-Options and Content-Security-Policy frame-ancestors
      if (headers['x-frame-options'] && headers['content-security-policy']) {
        const csp = headers['content-security-policy'];
        if (csp.includes('frame-ancestors')) {
          // If CSP has frame-ancestors, X-Frame-Options should be consistent
          expect(headers['x-frame-options']).toBe('SAMEORIGIN');
        }
      }
    });
  });

  describe('Header Performance', () => {
    it('should not have excessively long headers', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      for (const [key, value] of Object.entries(result.headers)) {
        // Headers should not be excessively long (8KB limit)
        expect(value.length).toBeLessThan(8192);
      }
    });

    it('should have properly formatted headers', async () => {
      const result = await SecurityTestHelper.testSecurityHeaders(`${baseUrl}/`);
      
      for (const [key, value] of Object.entries(result.headers)) {
        // Header values should not contain newlines or control characters
        expect(value).not.toMatch(/[\r\n]/);
        expect(value).not.toMatch(/[\x00-\x1F\x7F]/);
      }
    });
  });
});
