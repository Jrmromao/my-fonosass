/**
 * Input Validation Security Tests
 * 
 * Tests for input validation vulnerabilities and security measures
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SecurityTestHelper, SecurityAssertions, SECURITY_TEST_DATA } from './security-test-utils';

describe('Input Validation Security', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  beforeAll(() => {
    console.log('Setting up input validation security tests...');
  });

  afterAll(() => {
    console.log('Cleaning up input validation security tests...');
  });

  describe('XSS Protection', () => {
    it('should prevent XSS attacks in form inputs', async () => {
      const xssPayloads = SECURITY_TEST_DATA.xssPayloads;
      const formEndpoints = [
        '/api/forms',
        '/api/onboarding',
        '/api/activities',
      ];

      for (const endpoint of formEndpoints) {
        for (const payload of xssPayloads) {
          const result = await SecurityTestHelper.testXSSProtection(
            `${baseUrl}${endpoint}`,
            payload
          );
          SecurityAssertions.assertXSSProtection(result);
        }
      }
    });

    it('should sanitize user-generated content', async () => {
      const maliciousContent = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '<svg onload=alert("xss")>',
      ];

      for (const content of maliciousContent) {
        const response = await fetch(`${baseUrl}/api/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: content,
            description: content,
            type: 'SPEECH',
            difficulty: 'BEGINNER',
            ageRange: 'CHILD',
          }),
        });

        // Should either reject the content or sanitize it
        if (response.ok) {
          const result = await response.json();
          expect(result.name).not.toContain('<script>');
          expect(result.description).not.toContain('<script>');
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in search queries', async () => {
      const sqlPayloads = SECURITY_TEST_DATA.sqlInjectionPayloads;
      const searchEndpoints = [
        '/api/activities?search=',
        '/api/forms?search=',
      ];

      for (const endpoint of searchEndpoints) {
        for (const payload of sqlPayloads) {
          const result = await SecurityTestHelper.testSQLInjection(
            `${baseUrl}${endpoint}${encodeURIComponent(payload)}`,
            payload
          );
          SecurityAssertions.assertSQLInjectionProtection(result);
        }
      }
    });

    it('should prevent SQL injection in form data', async () => {
      const sqlPayloads = SECURITY_TEST_DATA.sqlInjectionPayloads;

      for (const payload of sqlPayloads) {
        const response = await fetch(`${baseUrl}/api/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: payload,
            description: payload,
            fields: [{ name: payload, type: 'text' }],
          }),
        });

        // Should reject SQL injection attempts
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('Email Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = SECURITY_TEST_DATA.invalidEmails;

      for (const email of invalidEmails) {
        const response = await fetch(`${baseUrl}/api/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            fullName: 'Test User',
            displayName: 'Test User',
            password: 'ValidPassword123!',
            role: 'USER',
          }),
        });

        // Should reject invalid email formats
        expect([400, 422]).toContain(response.status);
      }
    });

    it('should prevent email injection attacks', async () => {
      const emailInjectionPayloads = [
        'test@example.com\nBcc: hacker@evil.com',
        'test@example.com\r\nBcc: hacker@evil.com',
        'test@example.com%0ABcc: hacker@evil.com',
        'test@example.com%0DBcc: hacker@evil.com',
      ];

      for (const email of emailInjectionPayloads) {
        const response = await fetch(`${baseUrl}/api/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            fullName: 'Test User',
            displayName: 'Test User',
            password: 'ValidPassword123!',
            role: 'USER',
          }),
        });

        // Should reject email injection attempts
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('File Name Validation', () => {
    it('should prevent path traversal in file names', async () => {
      const pathTraversalNames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ];

      for (const fileName of pathTraversalNames) {
        const result = await SecurityTestHelper.testFileUpload(
          `${baseUrl}/api/upload`,
          {
            name: fileName,
            type: 'text/plain',
            content: 'test content',
          }
        );
        SecurityAssertions.assertFileUploadSecurity(result);
      }
    });

    it('should sanitize file names', async () => {
      const maliciousFileNames = [
        'file<script>alert("xss")</script>.txt',
        'file"onload="alert(\'xss\')".txt',
        'file\'onload="alert(\'xss\')".txt',
        'file; DROP TABLE files; --.txt',
      ];

      for (const fileName of maliciousFileNames) {
        const formData = new FormData();
        formData.append('file', new Blob(['test'], { type: 'text/plain' }), fileName);
        
        const response = await fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        // Should either reject or sanitize malicious file names
        if (response.ok) {
          const result = await response.json();
          expect(result.fileName).not.toContain('<script>');
          expect(result.fileName).not.toContain('DROP TABLE');
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });
  });

  describe('Input Length Validation', () => {
    it('should enforce maximum input lengths', async () => {
      const longInputs = [
        'A'.repeat(10000), // Very long string
        'A'.repeat(100000), // Extremely long string
      ];

      for (const longInput of longInputs) {
        const response = await fetch(`${baseUrl}/api/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: longInput,
            description: longInput,
            type: 'SPEECH',
            difficulty: 'BEGINNER',
            ageRange: 'CHILD',
          }),
        });

        // Should reject overly long inputs
        expect([400, 413, 422]).toContain(response.status);
      }
    });

    it('should handle null and undefined inputs gracefully', async () => {
      const nullInputs = [
        null,
        undefined,
        '',
        '   ',
      ];

      for (const nullInput of nullInputs) {
        const response = await fetch(`${baseUrl}/api/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nullInput,
            description: nullInput,
            type: 'SPEECH',
            difficulty: 'BEGINNER',
            ageRange: 'CHILD',
          }),
        });

        // Should handle null/undefined inputs appropriately
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('Type Validation', () => {
    it('should validate enum values', async () => {
      const invalidEnumValues = [
        { type: 'INVALID_TYPE', difficulty: 'BEGINNER', ageRange: 'CHILD' },
        { type: 'SPEECH', difficulty: 'INVALID_DIFFICULTY', ageRange: 'CHILD' },
        { type: 'SPEECH', difficulty: 'BEGINNER', ageRange: 'INVALID_AGE' },
      ];

      for (const invalidEnum of invalidEnumValues) {
        const response = await fetch(`${baseUrl}/api/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Activity',
            description: 'Test Description',
            ...invalidEnum,
          }),
        });

        // Should reject invalid enum values
        expect([400, 422]).toContain(response.status);
      }
    });

    it('should validate data types', async () => {
      const invalidTypes = [
        { name: 123, description: 'Test' }, // Number instead of string
        { name: 'Test', description: true }, // Boolean instead of string
        { name: 'Test', description: ['array'] }, // Array instead of string
        { name: 'Test', description: { object: 'value' } }, // Object instead of string
      ];

      for (const invalidType of invalidTypes) {
        const response = await fetch(`${baseUrl}/api/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...invalidType,
            type: 'SPEECH',
            difficulty: 'BEGINNER',
            ageRange: 'CHILD',
          }),
        });

        // Should reject invalid data types
        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF tokens for state-changing operations', async () => {
      const stateChangingEndpoints = [
        '/api/activities',
        '/api/forms',
        '/api/onboarding',
      ];

      for (const endpoint of stateChangingEndpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test',
            description: 'Test Description',
          }),
        });

        // Should either require CSRF token or have other protection
        expect([400, 401, 403, 422]).toContain(response.status);
      }
    });
  });
});
