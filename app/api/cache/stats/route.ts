import { CacheManager, QueryCache } from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse('Authentication required', 401);
    }

    // Get cache statistics
    const cacheStats = CacheManager.getStats();
    
    // Get query cache stats (simplified)
    const queryCacheStats = {
      size: QueryCache['cache'].size,
      // Note: QueryCache doesn't expose detailed stats, but we can add them
    };

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: {
        memoryCache: cacheStats,
        queryCache: queryCacheStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return SecurityMiddleware.createErrorResponse(
      'Failed to fetch cache statistics',
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    switch (type) {
      case 'memory':
        CacheManager.clear();
        break;
      case 'queries':
        QueryCache.clear();
        break;
      case 'all':
      default:
        CacheManager.clear();
        QueryCache.clear();
        break;
    }

    return SecurityMiddleware.createSecureResponse({
      success: true,
      message: `Cache cleared: ${type}`
    });

  } catch (error) {
    return SecurityMiddleware.createErrorResponse(
      'Failed to clear cache',
      500
    );
  }
}
