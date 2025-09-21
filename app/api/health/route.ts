import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: await checkDatabase(),
        storage: await checkStorage(),
        external: await checkExternalServices()
      }
    };

    const responseTime = Date.now() - startTime;
    
    // Determine overall health status
    const allChecksPassed = Object.values(checks.checks).every(check => check.status === 'healthy');
    checks.status = allChecksPassed ? 'healthy' : 'unhealthy';

    const statusCode = allChecksPassed ? 200 : 503;
    
    return SecurityMiddleware.createSecureResponse(
      {
        ...checks,
        responseTime: `${responseTime}ms`
      },
      statusCode,
      {
        'X-Health-Check': 'true',
        'X-Response-Time': `${responseTime}ms`
      }
    );

  } catch (error) {
    return SecurityMiddleware.createErrorResponse(
      'Health check failed',
      503,
      {
        'X-Health-Check': 'false'
      }
    );
  }
}

async function checkDatabase(): Promise<{ status: string; details: string; responseTime?: number }> {
  try {
    const startTime = Date.now();
    
    // Simple database connectivity test
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      details: 'Database connection successful',
      responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkStorage(): Promise<{ status: string; details: string }> {
  try {
    // Check if S3 configuration is present
    const hasS3Config = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME
    );

    if (!hasS3Config) {
      return {
        status: 'warning',
        details: 'S3 configuration missing - file uploads may not work'
      };
    }

    return {
      status: 'healthy',
      details: 'Storage configuration present'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkExternalServices(): Promise<{ status: string; details: string }> {
  try {
    const services = [];
    
    // Check Clerk configuration
    if (process.env.CLERK_SECRET_KEY) {
      services.push('Clerk (Authentication)');
    }
    
    // Check Stripe configuration
    if (process.env.STRIPE_SECRET_KEY) {
      services.push('Stripe (Payments)');
    }
    
    // Check Resend configuration
    if (process.env.RESEND_API_KEY) {
      services.push('Resend (Email)');
    }

    if (services.length === 0) {
      return {
        status: 'warning',
        details: 'No external services configured'
      };
    }

    return {
      status: 'healthy',
      details: `External services configured: ${services.join(', ')}`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `External services check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
