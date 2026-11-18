import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from './clientIp';

// Shared store: when Upstash credentials exist, counters live in Redis so the
// limit holds across serverless instances. Without them (local dev, tests) the
// limiter falls back to per-process memory.
const redis: Redis | null =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

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

if (!redis && process.env.NODE_ENV === 'production') {
  // Without Redis each serverless instance counts on its own, so limits are
  // weak. Visible in the logs so a missing env var is noticed.
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN missing: using per-instance memory'
  );
}

class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();
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
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up old entries
    this.cleanup(windowStart);

    const current = this.requests.get(key) || {
      count: 0,
      resetTime: now + this.config.windowMs,
    };

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
        totalHits: current.count,
      };
    }

    // Increment counter
    current.count++;
    this.requests.set(key, current);

    return {
      success: true,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime,
      totalHits: current.count,
    };
  }

  /**
   * Same contract as check(), but backed by Redis when configured so limits
   * are shared across serverless instances. Falls back to memory on any
   * Redis error (fail-open on availability, never blocks real users).
   */
  async checkAsync(request: NextRequest): Promise<RateLimitResult> {
    if (!redis) return this.check(request);

    const key = `rl:${this.config.keyGenerator ? this.config.keyGenerator(request) : this.getDefaultKey(request)}`;
    try {
      const hits = await redis.incr(key);
      if (hits === 1) await redis.pexpire(key, this.config.windowMs);
      const ttl = await redis.pttl(key);
      const resetTime = Date.now() + (ttl > 0 ? ttl : this.config.windowMs);
      return {
        success: hits <= this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - hits),
        resetTime,
        totalHits: hits,
      };
    } catch {
      return this.check(request);
    }
  }

  private getDefaultKey(request: NextRequest): string {
    return getClientIp(request);
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
      totalRequests,
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
      const ip = getClientIp(req);
      return `general:${ip}`;
    },
  }),

  // Authentication endpoints (stricter)
  auth: RateLimiter.getInstance('auth', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    keyGenerator: (req) => {
      const ip = getClientIp(req);
      return `auth:${ip}`;
    },
  }),

  // User creation (very strict)
  userCreation: RateLimiter.getInstance('userCreation', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (req) => {
      const ip = getClientIp(req);
      return `userCreation:${ip}`;
    },
  }),

  // File uploads
  fileUpload: RateLimiter.getInstance('fileUpload', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      const ip = getClientIp(req);
      return `fileUpload:${ip}`;
    },
  }),

  // Paid AI generation (OpenAI cost): tight per-client budget
  aiGeneration: RateLimiter.getInstance('aiGeneration', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => `aiGeneration:${getClientIp(req)}`,
  }),

  // Payment processing (very strict)
  payment: RateLimiter.getInstance('payment', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => {
      const ip = getClientIp(req);
      return `payment:${ip}`;
    },
  }),
};

// Middleware function to apply rate limiting
export function withRateLimit(
  limiterName: keyof typeof rateLimiters,
  customResponse?: (result: RateLimitResult) => NextResponse
) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (req: NextRequest): Promise<NextResponse> {
      const limiter = rateLimiters[limiterName];
      const result = await limiter.checkAsync(req);

      if (!result.success) {
        if (customResponse) {
          return customResponse(result);
        }

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': Math.ceil(
                (result.resetTime - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(req);
      response.headers.set(
        'X-RateLimit-Limit',
        limiter['config'].maxRequests.toString()
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        result.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(result.resetTime).toISOString()
      );

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
    config: limiter['config'],
  };
}
