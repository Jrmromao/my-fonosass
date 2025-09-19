import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format').max(255);
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').max(20);

// SQL injection prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .replace(/[--]/g, '') // Remove SQL comments
    .replace(/[\/\*]/g, '') // Remove SQL comments
    .trim();
};

// XSS prevention
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting helper
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): { allowed: boolean; remaining: number } => {
    const now = Date.now();
    const current = requests.get(identifier) || { count: 0, resetTime: now + windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    if (current.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    current.count++;
    requests.set(identifier, current);
    return { allowed: true, remaining: maxRequests - current.count };
  };
};
