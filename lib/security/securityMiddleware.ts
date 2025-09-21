import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, ErrorTracker } from '../monitoring/errorTracker';
import { PerformanceMonitor } from '../monitoring/performanceMonitor';
import { InputValidator } from './inputValidator';
import { rateLimiters } from './rateLimiter';

export interface SecurityConfig {
  requireAuth?: boolean;
  rateLimitType?: 'general' | 'auth' | 'userCreation' | 'fileUpload' | 'payment';
  validateInput?: boolean;
  allowedMethods?: string[];
  maxBodySize?: number;
  enablePerformanceMonitoring?: boolean;
}

export class SecurityMiddleware {
  static async apply(
    request: NextRequest,
    config: SecurityConfig = {}
  ): Promise<{ 
    success: boolean; 
    response?: NextResponse; 
    userId?: string;
    startTime?: number;
  }> {
    const startTime = Date.now();
    const requestId = PerformanceMonitor.startRequest(request);

    try {
      // 1. Method validation
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        return {
          success: false,
          response: new NextResponse(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { 'Content-Type': 'application/json' } }
          )
        };
      }

      // 2. Body size validation
      if (config.maxBodySize) {
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > config.maxBodySize) {
          return {
            success: false,
            response: new NextResponse(
              JSON.stringify({ error: 'Request body too large' }),
              { status: 413, headers: { 'Content-Type': 'application/json' } }
            )
          };
        }
      }

      // 3. Rate limiting
      if (config.rateLimitType) {
        const limiter = rateLimiters[config.rateLimitType];
        const rateLimitResult = limiter.check(request);

        if (!rateLimitResult.success) {
          return {
            success: false,
            response: new NextResponse(
              JSON.stringify({
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
                  'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                  'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                  'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                }
              }
            )
          };
        }
      }

      // 4. Authentication
      let userId: string | undefined;
      if (config.requireAuth) {
        try {
          const { userId: authUserId } = await auth();
          if (!authUserId) {
            throw new AuthenticationError('Authentication required');
          }
          userId = authUserId;
        } catch (error) {
          ErrorTracker.logError(error as Error, {
            category: 'auth',
            severity: 'high',
            url: request.url,
            method: request.method
          });

          return {
            success: false,
            response: new NextResponse(
              JSON.stringify({ error: 'Authentication required' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
          };
        }
      }

      // 5. Input validation
      if (config.validateInput && request.method !== 'GET') {
        try {
          const body = await request.json();
          const sanitizedBody = InputValidator.sanitizeObject(body);
          
          // Replace the request body with sanitized version
          const sanitizedRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody)
          });
          
          // Update the request object
          Object.assign(request, sanitizedRequest);
        } catch (error) {
          ErrorTracker.logError(error as Error, {
            category: 'api',
            severity: 'medium',
            url: request.url,
            method: request.method,
            userId
          });

          return {
            success: false,
            response: new NextResponse(
              JSON.stringify({ error: 'Invalid request body' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          };
        }
      }

      // 6. Security headers validation
      const securityHeaders = this.validateSecurityHeaders(request);
      if (!securityHeaders.valid) {
        ErrorTracker.logError(new Error('Security headers validation failed'), {
          category: 'security',
          severity: 'high',
          url: request.url,
          method: request.method,
          metadata: { missingHeaders: securityHeaders.missing }
        });
      }

      return {
        success: true,
        userId,
        startTime
      };

    } catch (error) {
      ErrorTracker.logAPIError(error as Error, request, {
        category: 'security',
        severity: 'high'
      });

      return {
        success: false,
        response: new NextResponse(
          JSON.stringify({ error: 'Security validation failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }
  }

  static validateSecurityHeaders(request: NextRequest): { 
    valid: boolean; 
    missing: string[] 
  } {
    const requiredHeaders = [
      'user-agent',
      'accept',
      'accept-language'
    ];

    const missing: string[] = [];
    
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        missing.push(header);
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr'
    ];

    for (const header of suspiciousHeaders) {
      if (request.headers.get(header)) {
        // Log suspicious header usage
        ErrorTracker.logError(new Error('Suspicious header detected'), {
          category: 'security',
          severity: 'medium',
          url: request.url,
          method: request.method,
          metadata: { suspiciousHeader: header }
        });
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  static createSecureResponse(
    data: any,
    status: number = 200,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    const response = NextResponse.json(data, { status });
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add additional headers
    for (const [key, value] of Object.entries(additionalHeaders)) {
      response.headers.set(key, value);
    }
    
    return response;
  }

  static createErrorResponse(
    error: string,
    status: number = 400,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    return this.createSecureResponse(
      { error, timestamp: new Date().toISOString() },
      status,
      additionalHeaders
    );
  }
}

// Convenience function for API routes
export function withSecurity(
  config: SecurityConfig = {}
) {
  return function<T extends any[]>(
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async function(req: NextRequest, ...args: T): Promise<NextResponse> {
      const securityResult = await SecurityMiddleware.apply(req, config);
      
      if (!securityResult.success) {
        return securityResult.response!;
      }

      try {
        const response = await handler(req, ...args);
        
        // Add performance monitoring headers
        if (securityResult.startTime) {
          const responseTime = Date.now() - securityResult.startTime;
          response.headers.set('X-Response-Time', `${responseTime}ms`);
        }
        
        return response;
      } catch (error) {
        ErrorTracker.logAPIError(error as Error, req, {
          userId: securityResult.userId,
          category: 'api',
          severity: 'high'
        });

        return SecurityMiddleware.createErrorResponse(
          'Internal server error',
          500
        );
      }
    };
  };
}
