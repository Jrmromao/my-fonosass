/**
 * Security Testing Utilities
 * 
 * This file contains utilities and helpers for security testing
 * across the FonoSaaS application.
 */

import { NextRequest } from 'next/server';

// Test data for security testing
export const SECURITY_TEST_DATA = {
  // XSS payloads
  xssPayloads: [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '<svg onload=alert("xss")>',
    '"><script>alert("xss")</script>',
    "'><script>alert('xss')</script>",
  ],
  
  // SQL injection payloads
  sqlInjectionPayloads: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  ],
  
  // File upload test files
  maliciousFiles: [
    { name: 'test.exe', type: 'application/x-executable' },
    { name: 'test.php', type: 'application/x-php' },
    { name: 'test.jsp', type: 'application/x-jsp' },
    { name: '../../../etc/passwd', type: 'text/plain' },
  ],
  
  // Invalid email formats
  invalidEmails: [
    'notanemail',
    '@domain.com',
    'user@',
    'user@domain',
    'user..name@domain.com',
    'user@domain..com',
  ],
  
  // Invalid user IDs
  invalidUserIds: [
    'not-a-user-id',
    'user_',
    'user_123',
    'admin',
    'root',
    '',
    null,
    undefined,
  ],
};

// Security test helpers
export class SecurityTestHelper {
  /**
   * Create a mock NextRequest with security headers
   */
  static createMockRequest(options: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}): NextRequest {
    const url = options.url || 'http://localhost:3000/api/test';
    const method = options.method || 'GET';
    const headers = new Headers(options.headers || {});
    
    return new NextRequest(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  /**
   * Test for XSS vulnerabilities
   */
  static async testXSSProtection(
    endpoint: string,
    payload: string,
    method: string = 'POST'
  ): Promise<{ vulnerable: boolean; response: string }> {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: payload }),
      });
      
      const responseText = await response.text();
      const vulnerable = responseText.includes(payload);
      
      return { vulnerable, response: responseText };
    } catch (error) {
      return { vulnerable: false, response: error.message };
    }
  }

  /**
   * Test for SQL injection vulnerabilities
   */
  static async testSQLInjection(
    endpoint: string,
    payload: string,
    method: string = 'POST'
  ): Promise<{ vulnerable: boolean; response: string }> {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: payload }),
      });
      
      const responseText = await response.text();
      const vulnerable = responseText.includes('error') || 
                        responseText.includes('syntax') ||
                        responseText.includes('database');
      
      return { vulnerable, response: responseText };
    } catch (error) {
      return { vulnerable: false, response: error.message };
    }
  }

  /**
   * Test file upload security
   */
  static async testFileUpload(
    endpoint: string,
    file: { name: string; type: string; content: string }
  ): Promise<{ allowed: boolean; response: string }> {
    try {
      const formData = new FormData();
      const blob = new Blob([file.content], { type: file.type });
      formData.append('file', blob, file.name);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const responseText = await response.text();
      const allowed = response.ok;
      
      return { allowed, response: responseText };
    } catch (error) {
      return { allowed: false, response: error.message };
    }
  }

  /**
   * Test authentication bypass
   */
  static async testAuthBypass(
    endpoint: string,
    method: string = 'GET'
  ): Promise<{ bypassed: boolean; response: string }> {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });
      
      const responseText = await response.text();
      const bypassed = response.ok;
      
      return { bypassed, response: responseText };
    } catch (error) {
      return { bypassed: false, response: error.message };
    }
  }

  /**
   * Test rate limiting
   */
  static async testRateLimit(
    endpoint: string,
    requests: number = 100,
    method: string = 'GET'
  ): Promise<{ rateLimited: boolean; responses: string[] }> {
    const responses: string[] = [];
    let rateLimited = false;
    
    for (let i = 0; i < requests; i++) {
      try {
        const response = await fetch(endpoint, { method });
        const responseText = await response.text();
        responses.push(responseText);
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      } catch (error) {
        responses.push(error.message);
      }
    }
    
    return { rateLimited, responses };
  }

  /**
   * Test security headers
   */
  static async testSecurityHeaders(
    endpoint: string
  ): Promise<{ headers: Record<string, string>; missing: string[] }> {
    try {
      const response = await fetch(endpoint);
      const headers: Record<string, string> = {};
      const missing: string[] = [];
      
      // Required security headers
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy',
        'referrer-policy',
      ];
      
      // Extract headers
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });
      
      // Check for missing headers
      requiredHeaders.forEach(header => {
        if (!headers[header]) {
          missing.push(header);
        }
      });
      
      return { headers, missing };
    } catch (error) {
      return { headers: {}, missing: ['all'] };
    }
  }
}

// Security test assertions
export class SecurityAssertions {
  /**
   * Assert that XSS protection is working
   */
  static assertXSSProtection(result: { vulnerable: boolean; response: string }) {
    if (result.vulnerable) {
      throw new Error(`XSS vulnerability detected: ${result.response}`);
    }
  }

  /**
   * Assert that SQL injection protection is working
   */
  static assertSQLInjectionProtection(result: { vulnerable: boolean; response: string }) {
    if (result.vulnerable) {
      throw new Error(`SQL injection vulnerability detected: ${result.response}`);
    }
  }

  /**
   * Assert that file upload security is working
   */
  static assertFileUploadSecurity(result: { allowed: boolean; response: string }) {
    if (result.allowed) {
      throw new Error(`File upload security bypassed: ${result.response}`);
    }
  }

  /**
   * Assert that authentication is required
   */
  static assertAuthenticationRequired(result: { bypassed: boolean; response: string }) {
    if (result.bypassed) {
      throw new Error(`Authentication bypassed: ${result.response}`);
    }
  }

  /**
   * Assert that rate limiting is working
   */
  static assertRateLimit(result: { rateLimited: boolean; responses: string[] }) {
    if (!result.rateLimited) {
      throw new Error(`Rate limiting not working: ${result.responses.length} requests allowed`);
    }
  }

  /**
   * Assert that security headers are present
   */
  static assertSecurityHeaders(result: { headers: Record<string, string>; missing: string[] }) {
    if (result.missing.length > 0) {
      throw new Error(`Missing security headers: ${result.missing.join(', ')}`);
    }
  }
}

// Security test data generators
export class SecurityTestDataGenerator {
  /**
   * Generate random test data
   */
  static generateRandomData() {
    return {
      email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
      username: `user${Math.random().toString(36).substr(2, 9)}`,
      password: `Pass${Math.random().toString(36).substr(2, 9)}!`,
    };
  }

  /**
   * Generate malicious test data
   */
  static generateMaliciousData() {
    return {
      xssEmail: `<script>alert('xss')</script>@example.com`,
      sqlUsername: `'; DROP TABLE users; --`,
      pathTraversalFile: '../../../etc/passwd',
    };
  }

  /**
   * Generate large payload for DoS testing
   */
  static generateLargePayload(size: number = 1024 * 1024) {
    return 'A'.repeat(size);
  }
}

export default {
  SECURITY_TEST_DATA,
  SecurityTestHelper,
  SecurityAssertions,
  SecurityTestDataGenerator,
};
