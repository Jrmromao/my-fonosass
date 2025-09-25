/**
 * Database Optimization Configuration for AWS RDS Cost Efficiency
 *
 * This file contains optimized database configurations and query patterns
 * to minimize AWS RDS costs while maintaining performance.
 */

import { PrismaClient } from '@prisma/client';

// Optimized Prisma Client Configuration
export const createOptimizedPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling optimization
    // Note: __internal is not available in current Prisma version
    // Using standard configuration instead
  });
};

// Query Optimization Patterns
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = createOptimizedPrismaClient();
  }

  public static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Optimized user queries with minimal data fetching
   */
  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptions: {
          select: {
            status: true,
            tier: true,
            currentPeriodEnd: true,
          },
        },
      },
    });
  }

  /**
   * Optimized activities query with pagination
   */
  async getActivitiesPaginated(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.activity.findMany({
      where: {
        isPublic: true,
        ...filters,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        difficulty: true,
        ageRange: true,
        createdAt: true,
        categories: {
          select: {
            name: true,
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            s3Url: true,
            fileType: true,
          },
          take: 1, // Only get first file for thumbnail
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Optimized subscription check
   */
  async checkUserSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        tier: true,
        currentPeriodEnd: true,
      },
    });
  }

  /**
   * Optimized download tracking
   */
  async trackDownload(userId: string, activityId: string, fileName: string) {
    return this.prisma.download.create({
      data: {
        userId,
        exerciseId: activityId,
      },
    });
  }

  /**
   * Batch operations for better performance
   */
  async batchCreateDownloads(
    downloads: Array<{ userId: string; exerciseId: string }>
  ) {
    return this.prisma.download.createMany({
      data: downloads,
      skipDuplicates: true,
    });
  }

  /**
   * Optimized consent record queries
   */
  async getUserConsentRecords(userId: string) {
    return this.prisma.consentRecord.findMany({
      where: { userId },
      select: {
        id: true,
        consentType: true,
        granted: true,
        grantedAt: true,
        expiresAt: true,
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });
  }

  /**
   * Cleanup old data to reduce storage costs
   */
  async cleanupOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean up old download history
    const deletedDownloads = await this.prisma.download.deleteMany({
      where: {
        downloadedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Clean up old consent audit logs
    const deletedAuditLogs = await this.prisma.consentAuditLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return {
      deletedDownloads: deletedDownloads.count,
      deletedAuditLogs: deletedAuditLogs.count,
    };
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats() {
    const [userCount, activityCount, downloadCount, subscriptionCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.activity.count(),
        this.prisma.download.count(),
        this.prisma.subscription.count(),
      ]);

    return {
      users: userCount,
      activities: activityCount,
      downloads: downloadCount,
      subscriptions: subscriptionCount,
    };
  }
}

// Connection Pool Configuration for AWS RDS
export const DATABASE_CONFIG = {
  // Connection pooling settings
  connectionPool: {
    min: 2, // Minimum connections
    max: 10, // Maximum connections (adjust based on RDS instance)
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },

  // Query optimization
  query: {
    timeout: 30000, // 30 seconds
    maxRetries: 3, // Retry failed queries
    retryDelay: 1000, // 1 second delay between retries
  },

  // AWS RDS specific optimizations
  rds: {
    // Use read replicas for read queries when available
    useReadReplicas: process.env.NODE_ENV === 'production',
    // Connection string optimization
    sslMode: 'require',
    // Connection pooling
    poolSize: 10,
    // Query optimization
    statementTimeout: 30000,
  },
};

// Environment-specific configurations
export const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Add connection pooling parameters for production
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(baseUrl);
    url.searchParams.set('connection_limit', '10');
    url.searchParams.set('pool_timeout', '20');
    url.searchParams.set('statement_timeout', '30000');
    url.searchParams.set('idle_in_transaction_session_timeout', '300000');
    return url.toString();
  }

  return baseUrl;
};

// Migration optimization
export const MIGRATION_CONFIG = {
  // Batch size for large migrations
  batchSize: 1000,
  // Timeout for migrations
  timeout: 300000, // 5 minutes
  // Retry configuration
  retries: 3,
  retryDelay: 5000,
};

export default DatabaseOptimizer;
