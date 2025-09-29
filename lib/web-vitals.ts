import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface WebVitalsMetric extends Metric {
  url: string;
  timestamp: number;
  userAgent?: string;
  connectionType?: string;
  deviceMemory?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface WebVitalsConfig {
  debug?: boolean;
  reportToGoogleAnalytics?: boolean;
  reportToVercelAnalytics?: boolean;
  customEndpoint?: string;
  sampleRate?: number;
  thresholds?: {
    LCP: number;
    INP: number;
    CLS: number;
    FCP: number;
    TTFB: number;
  };
}

class WebVitalsReporter {
  private config: Required<WebVitalsConfig>;
  private metrics: WebVitalsMetric[] = [];
  private readonly MAX_METRICS = 1000;

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      debug: false,
      reportToGoogleAnalytics: true,
      reportToVercelAnalytics: true,
      customEndpoint: '/api/web-vitals',
      sampleRate: 1.0,
      thresholds: {
        LCP: 2500, // Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
        INP: 200, // Good: < 200ms, Needs Improvement: 200ms - 500ms, Poor: > 500ms
        CLS: 0.1, // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
        FCP: 1800, // Good: < 1.8s, Needs Improvement: 1.8s - 3s, Poor: > 3s
        TTFB: 800, // Good: < 800ms, Needs Improvement: 800ms - 1.8s, Poor: > 1.8s
      },
      ...config,
    };
  }

  private getDeviceInfo(): Partial<WebVitalsMetric> {
    if (typeof window === 'undefined') return {};

    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;

    return {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: connection?.effectiveType,
      deviceMemory: connection?.deviceMemory || memory?.jsHeapSizeLimit,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private getMetricRating(
    metric: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const threshold =
      this.config.thresholds[metric as keyof typeof this.config.thresholds];

    if (metric === 'CLS') {
      if (value <= threshold) return 'good';
      if (value <= threshold * 2.5) return 'needs-improvement';
      return 'poor';
    } else {
      if (value <= threshold) return 'good';
      if (value <= threshold * 2) return 'needs-improvement';
      return 'poor';
    }
  }

  private async reportMetric(metric: WebVitalsMetric): Promise<void> {
    // Add to local metrics
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Determine rating
    const rating = this.getMetricRating(metric.name, metric.value);

    if (this.config.debug) {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id,
        url: metric.url,
      });
    }

    // Report to Google Analytics
    if (
      this.config.reportToGoogleAnalytics &&
      typeof window !== 'undefined' &&
      window.gtag
    ) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        non_interaction: true,
        metric_rating: rating,
        metric_delta: metric.delta,
      });
    }

    // Report to Vercel Analytics
    if (
      this.config.reportToVercelAnalytics &&
      typeof window !== 'undefined' &&
      window.va
    ) {
      window.va('event', metric.name);
    }

    // Report to custom endpoint
    if (this.config.customEndpoint) {
      try {
        await fetch(this.config.customEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        });
      } catch (error) {
        if (this.config.debug) {
          console.warn(
            '[Web Vitals] Failed to report to custom endpoint:',
            error
          );
        }
      }
    }
  }

  public startTracking(): void {
    if (typeof window === 'undefined') return;

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return;

    const deviceInfo = this.getDeviceInfo();

    // Track Core Web Vitals
    onCLS((metric) => {
      this.reportMetric({ ...metric, ...deviceInfo } as WebVitalsMetric);
    });

    onINP((metric) => {
      this.reportMetric({ ...metric, ...deviceInfo } as WebVitalsMetric);
    });

    onFCP((metric) => {
      this.reportMetric({ ...metric, ...deviceInfo } as WebVitalsMetric);
    });

    onLCP((metric) => {
      this.reportMetric({ ...metric, ...deviceInfo } as WebVitalsMetric);
    });

    onTTFB((metric) => {
      this.reportMetric({ ...metric, ...deviceInfo } as WebVitalsMetric);
    });
  }

  public getMetrics(): WebVitalsMetric[] {
    return [...this.metrics];
  }

  public getMetricsSummary(): {
    total: number;
    byMetric: Record<
      string,
      {
        count: number;
        average: number;
        good: number;
        needsImprovement: number;
        poor: number;
      }
    >;
    recent: WebVitalsMetric[];
  } {
    const recent = this.metrics.slice(-100); // Last 100 metrics
    const byMetric: Record<string, any> = {};

    recent.forEach((metric) => {
      if (!byMetric[metric.name]) {
        byMetric[metric.name] = {
          count: 0,
          total: 0,
          good: 0,
          needsImprovement: 0,
          poor: 0,
        };
      }

      const rating = this.getMetricRating(metric.name, metric.value);
      byMetric[metric.name].count++;
      byMetric[metric.name].total += metric.value;
      byMetric[metric.name][rating]++;
    });

    // Calculate averages
    Object.keys(byMetric).forEach((metric) => {
      byMetric[metric].average =
        byMetric[metric].total / byMetric[metric].count;
    });

    return {
      total: recent.length,
      byMetric,
      recent,
    };
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}

// Global instance
let webVitalsReporter: WebVitalsReporter | null = null;

export function initWebVitals(config?: WebVitalsConfig): WebVitalsReporter {
  if (typeof window === 'undefined') {
    throw new Error('Web Vitals can only be initialized in the browser');
  }

  if (!webVitalsReporter) {
    webVitalsReporter = new WebVitalsReporter(config);
    webVitalsReporter.startTracking();
  }

  return webVitalsReporter;
}

export function getWebVitalsReporter(): WebVitalsReporter | null {
  return webVitalsReporter;
}

// Export individual functions for manual tracking
export { onCLS, onFCP, onINP, onLCP, onTTFB };
