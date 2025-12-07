'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Get performance metrics
    const getPerformanceMetrics = () => {
      if (typeof window === 'undefined') return;

      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const fcp =
        paint.find((entry) => entry.name === 'first-contentful-paint')
          ?.startTime || 0;
      const lcp =
        performance.getEntriesByType('largest-contentful-paint')[0]
          ?.startTime || 0;
      const ttfb = navigation.responseStart - navigation.requestStart;

      // CLS calculation (simplified)
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            cls += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });

      // FID calculation (simplified)
      let fid = 0;
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          fid = (entry as any).processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      setMetrics({
        fcp: Math.round(fcp),
        lcp: Math.round(lcp),
        fid: Math.round(fid),
        cls: Math.round(cls * 1000) / 1000,
        ttfb: Math.round(ttfb),
      });
    };

    // Wait for page load
    if (document.readyState === 'complete') {
      getPerformanceMetrics();
    } else {
      window.addEventListener('load', getPerformanceMetrics);
    }

    // Show after 2 seconds
    const timer = setTimeout(() => setIsVisible(true), 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', getPerformanceMetrics);
    };
  }, []);

  if (!isVisible || !metrics) return null;

  const getScore = (
    value: number,
    thresholds: { good: number; poor: number }
  ) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const scores = {
    fcp: getScore(metrics.fcp, { good: 1800, poor: 3000 }),
    lcp: getScore(metrics.lcp, { good: 2500, poor: 4000 }),
    fid: getScore(metrics.fid, { good: 100, poor: 300 }),
    cls: getScore(metrics.cls, { good: 0.1, poor: 0.25 }),
    ttfb: getScore(metrics.ttfb, { good: 800, poor: 1800 }),
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold mb-2">Performance Monitor</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span
            className={`font-mono ${scores.fcp === 'good' ? 'text-green-600' : scores.fcp === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {metrics.fcp}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>LCP:</span>
          <span
            className={`font-mono ${scores.lcp === 'good' ? 'text-green-600' : scores.lcp === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {metrics.lcp}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>FID:</span>
          <span
            className={`font-mono ${scores.fid === 'good' ? 'text-green-600' : scores.fid === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {metrics.fid}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span
            className={`font-mono ${scores.cls === 'good' ? 'text-green-600' : scores.cls === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {metrics.cls}
          </span>
        </div>
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span
            className={`font-mono ${scores.ttfb === 'good' ? 'text-green-600' : scores.ttfb === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {metrics.ttfb}ms
          </span>
        </div>
      </div>
    </div>
  );
}
