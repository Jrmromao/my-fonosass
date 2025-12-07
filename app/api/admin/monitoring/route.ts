import { ErrorTracker } from '@/lib/monitoring/errorTracker';
import { PerformanceMonitor } from '@/lib/monitoring/performanceMonitor';
import { getRateLimitStatus } from '@/lib/security/rateLimiter';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse('Authentication required', 401);
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user to access monitoring
    // In production, you should check if the user has admin privileges

    // Get error statistics
    const errorStats = ErrorTracker.getErrorStats();
    
    // Get performance statistics
    const performanceStats = PerformanceMonitor.getPerformanceStats();
    
    // Get rate limiting statistics
    const rateLimitStats = {
      general: getRateLimitStatus('general'),
      auth: getRateLimitStatus('auth'),
      userCreation: getRateLimitStatus('userCreation'),
      fileUpload: getRateLimitStatus('fileUpload'),
      payment: getRateLimitStatus('payment')
    };

    // Get system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    // Calculate health score
    const healthScore = calculateHealthScore(errorStats, performanceStats);

    const monitoringData = {
      health: {
        score: healthScore,
        status: getHealthStatus(healthScore),
        timestamp: new Date().toISOString()
      },
      errors: errorStats,
      performance: performanceStats,
      rateLimiting: rateLimitStats,
      system: systemInfo
    };

    return SecurityMiddleware.createSecureResponse(monitoringData);

  } catch (error) {
    ErrorTracker.logAPIError(error as Error, request, {
      category: 'api',
      severity: 'high'
    });

    return SecurityMiddleware.createErrorResponse(
      'Failed to retrieve monitoring data',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear-errors':
        ErrorTracker.clearErrors();
        return SecurityMiddleware.createSecureResponse({ 
          message: 'Error logs cleared successfully' 
        });

      case 'clear-metrics':
        PerformanceMonitor.clearMetrics();
        return SecurityMiddleware.createSecureResponse({ 
          message: 'Performance metrics cleared successfully' 
        });

      case 'clear-all':
        ErrorTracker.clearErrors();
        PerformanceMonitor.clearMetrics();
        return SecurityMiddleware.createSecureResponse({ 
          message: 'All monitoring data cleared successfully' 
        });

      default:
        return SecurityMiddleware.createErrorResponse(
          'Invalid action specified',
          400
        );
    }

  } catch (error) {
    ErrorTracker.logAPIError(error as Error, request, {
      category: 'api',
      severity: 'medium'
    });

    return SecurityMiddleware.createErrorResponse(
      'Failed to execute monitoring action',
      500
    );
  }
}

function calculateHealthScore(errorStats: any, performanceStats: any): number {
  let score = 100;

  // Deduct points for errors
  const criticalErrors = errorStats.bySeverity.critical || 0;
  const highErrors = errorStats.bySeverity.high || 0;
  const mediumErrors = errorStats.bySeverity.medium || 0;
  const lowErrors = errorStats.bySeverity.low || 0;

  score -= criticalErrors * 20; // -20 points per critical error
  score -= highErrors * 10;     // -10 points per high error
  score -= mediumErrors * 5;    // -5 points per medium error
  score -= lowErrors * 1;       // -1 point per low error

  // Deduct points for performance issues
  if (performanceStats.averageResponseTime > 2000) {
    score -= 20; // Slow response times
  } else if (performanceStats.averageResponseTime > 1000) {
    score -= 10;
  }

  if (performanceStats.errorRate > 0.1) {
    score -= 30; // High error rate
  } else if (performanceStats.errorRate > 0.05) {
    score -= 15;
  }

  if (performanceStats.memoryUsage.current > 1000) {
    score -= 15; // High memory usage (1GB+)
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function getHealthStatus(score: number): 'healthy' | 'warning' | 'critical' {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'warning';
  return 'critical';
}
