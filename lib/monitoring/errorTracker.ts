import { NextRequest } from 'next/server';

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'api' | 'database' | 'file' | 'payment' | 'system' | 'security';
  stack?: string;
  metadata?: Record<string, any>;
}

export class ErrorTracker {
  private static errors: ErrorContext[] = [];
  private static readonly MAX_ERRORS = 1000;
  private static readonly CRITICAL_THRESHOLD = 10; // Alert after 10 critical errors

  static logError(error: Error, context: Partial<ErrorContext> = {}): void {
    const errorContext: ErrorContext = {
      timestamp: new Date(),
      severity: 'medium',
      category: 'system',
      stack: error.stack,
      ...context,
    };

    // Determine severity based on error type
    if (error.name === 'ValidationError') {
      errorContext.severity = 'low';
      errorContext.category = 'api';
    } else if (error.name === 'AuthenticationError') {
      errorContext.severity = 'high';
      errorContext.category = 'auth';
    } else if (error.name === 'DatabaseError') {
      errorContext.severity = 'high';
      errorContext.category = 'database';
    } else if (error.name === 'PaymentError') {
      errorContext.severity = 'critical';
      errorContext.category = 'payment';
    }

    // Add to error log
    this.errors.push(errorContext);

    // Keep only recent errors
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Check for critical error threshold
    const recentCriticalErrors = this.errors.filter(
      e => e.severity === 'critical' && 
      e.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    if (recentCriticalErrors.length >= this.CRITICAL_THRESHOLD) {
      this.sendAlert('Critical error threshold exceeded', {
        count: recentCriticalErrors.length,
        errors: recentCriticalErrors
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', {
        message: error.message,
        context: errorContext
      });
    }
  }

  static logAPIError(
    error: Error, 
    request: NextRequest, 
    additionalContext: Partial<ErrorContext> = {}
  ): void {
    this.logError(error, {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      ...additionalContext
    });
  }

  static getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentErrors: ErrorContext[];
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo);

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      bySeverity,
      byCategory,
      recentErrors
    };
  }

  private static sendAlert(message: string, data: any): void {
    // In production, this would send to monitoring service (Sentry, DataDog, etc.)
    console.error('🚨 ALERT:', message, data);
    
    // TODO: Implement actual alerting
    // - Send to Slack/Discord
    // - Send email to admin
    // - Create incident in monitoring system
  }

  static clearErrors(): void {
    this.errors = [];
  }
}

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}
