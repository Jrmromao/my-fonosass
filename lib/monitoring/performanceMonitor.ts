import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  ip?: string;
  memoryUsage?: NodeJS.MemoryUsage;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 5000;
  private static readonly SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds
  private static readonly HIGH_MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500MB

  static startRequest(request: NextRequest): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store request start time in request headers for later retrieval
    request.headers.set('x-request-id', requestId);
    request.headers.set('x-request-start', Date.now().toString());
    
    return requestId;
  }

  static endRequest(
    requestId: string,
    request: NextRequest,
    response: NextResponse,
    startTime: number
  ): void {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const metric: PerformanceMetrics = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: response.status,
      responseTime,
      timestamp: new Date(startTime),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      memoryUsage: process.memoryUsage()
    };

    // Add to metrics
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Check for slow requests
    if (responseTime > this.SLOW_REQUEST_THRESHOLD) {
      this.logSlowRequest(metric);
    }

    // Check for high memory usage
    if (metric.memoryUsage && metric.memoryUsage.heapUsed > this.HIGH_MEMORY_THRESHOLD) {
      this.logHighMemoryUsage(metric);
    }

    // Add performance headers to response
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Request-ID', requestId);
  }

  static getPerformanceStats(): {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
    memoryUsage: {
      average: number;
      peak: number;
      current: number;
    };
    topSlowEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      count: number;
    }>;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0;
    const slowRequests = recentMetrics.filter(m => m.responseTime > this.SLOW_REQUEST_THRESHOLD).length;
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / totalRequests || 0;

    // Memory usage stats
    const memoryUsages = recentMetrics
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!.heapUsed);
    
    const averageMemory = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length || 0;
    const peakMemory = Math.max(...memoryUsages, 0);
    const currentMemory = process.memoryUsage().heapUsed;

    // Top slow endpoints
    const endpointStats = new Map<string, { totalTime: number; count: number }>();
    recentMetrics.forEach(metric => {
      const endpoint = `${metric.method} ${metric.url}`;
      const existing = endpointStats.get(endpoint) || { totalTime: 0, count: 0 };
      existing.totalTime += metric.responseTime;
      existing.count += 1;
      endpointStats.set(endpoint, existing);
    });

    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: stats.totalTime / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsage: {
        average: Math.round(averageMemory / 1024 / 1024), // MB
        peak: Math.round(peakMemory / 1024 / 1024), // MB
        current: Math.round(currentMemory / 1024 / 1024) // MB
      },
      topSlowEndpoints
    };
  }

  private static logSlowRequest(metric: PerformanceMetrics): void {
    console.warn('🐌 Slow request detected:', {
      requestId: metric.requestId,
      method: metric.method,
      url: metric.url,
      responseTime: metric.responseTime,
      statusCode: metric.statusCode
    });
  }

  private static logHighMemoryUsage(metric: PerformanceMetrics): void {
    console.warn('🧠 High memory usage detected:', {
      requestId: metric.requestId,
      memoryUsage: {
        heapUsed: Math.round(metric.memoryUsage!.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(metric.memoryUsage!.heapTotal / 1024 / 1024), // MB
        external: Math.round(metric.memoryUsage!.external / 1024 / 1024) // MB
      }
    });
  }

  static clearMetrics(): void {
    this.metrics = [];
  }
}

// Middleware wrapper for automatic performance monitoring
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const requestId = PerformanceMonitor.startRequest(request);
    const startTime = Date.now();

    try {
      const response = await handler(...args);
      PerformanceMonitor.endRequest(requestId, request, response, startTime);
      return response;
    } catch (error) {
      // Create error response for monitoring
      const errorResponse = new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
      PerformanceMonitor.endRequest(requestId, request, errorResponse, startTime);
      throw error;
    }
  };
}
