/**
 * Enhanced Input Validation and Sanitization
 * Implements XSS protection, SQL injection prevention, and CSRF protection
 */

// XSS Protection
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    return parsedUrl.toString();
  } catch {
    return '';
  }
}

// SQL Injection Prevention
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, '') // Remove block comment ends
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, ''); // Remove SQL keywords
}

// General input sanitization
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// CSRF Token Generation
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF Token
export function validateCsrfToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}
