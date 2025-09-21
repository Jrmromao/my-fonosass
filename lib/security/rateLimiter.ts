import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  static getInstance(name: string, config: RateLimitConfig): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(config));
    }
    return this.instances.get(name)!;
  }

  check(request: NextRequest): RateLimitResult {
    const key = this.config.keyGenerator ? 
      this.config.keyGenerator(request) : 
      this.getDefaultKey(request);
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Clean up old entries
    this.cleanup(windowStart);
    
    const current = this.requests.get(key) || { count: 0, resetTime: now + this.config.windowMs };
    
    // Reset if window expired
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + this.config.windowMs;
    }
    
    // Check if limit exceeded
    if (current.count >= this.config.maxRequests) {
      this.requests.set(key, current);
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
        totalHits: current.count
      };
    }
    
    // Increment counter
    current.count++;
    this.requests.set(key, current);
    
    return {
      success: true,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime,
      totalHits: current.count
    };
  }

  private getDefaultKey(request: NextRequest): string {
    // Use IP address as default key
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous';
    return ip;
  }

  private cleanup(windowStart: number): void {
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < windowStart) {
        this.requests.delete(key);
      }
    }
  }

  // Get stats for monitoring
  getStats(): { totalKeys: number; totalRequests: number } {
    let totalRequests = 0;
    for (const value of this.requests.values()) {
      totalRequests += value.count;
    }
    
    return {
      totalKeys: this.requests.size,
      totalRequests
    };
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // General API rate limiting
  general: RateLimiter.getInstance('general', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      return `general:${ip}`;
    }
  }),

  // Authentication endpoints (stricter)
  auth: RateLimiter.getInstance('auth', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      return `auth:${ip}`;
    }
  }),

  // User creation (very strict)
  userCreation: RateLimiter.getInstance('userCreation', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      return `userCreation:${ip}`;
    }
  }),

  // File uploads
  fileUpload: RateLimiter.getInstance('fileUpload', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      return `fileUpload:${ip}`;
    }
  }),

  // Payment processing (very strict)
  payment: RateLimiter.getInstance('payment', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      return `payment:${ip}`;
    }
  })
};

// Middleware function to apply rate limiting
export function withRateLimit(
  limiterName: keyof typeof rateLimiters,
  customResponse?: (result: RateLimitResult) => NextResponse
) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function(req: NextRequest): Promise<NextResponse> {
      const limiter = rateLimiters[limiterName];
      const result = limiter.check(req);

      if (!result.success) {
        if (customResponse) {
          return customResponse(result);
        }

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(req);
      response.headers.set('X-RateLimit-Limit', limiter['config'].maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      return response;
    };
  };
}

// Utility function to get rate limit status
export function getRateLimitStatus(limiterName: keyof typeof rateLimiters): {
  stats: { totalKeys: number; totalRequests: number };
  config: RateLimitConfig;
} {
  const limiter = rateLimiters[limiterName];
  return {
    stats: limiter.getStats(),
    config: limiter['config']
  };
}
