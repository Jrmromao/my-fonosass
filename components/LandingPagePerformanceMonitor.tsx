'use client';

import { getWebVitalsReporter } from '@/lib/web-vitals';
import { useEffect, useState } from 'react';

export default function LandingPagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  useEffect(() => {
    const reporter = getWebVitalsReporter();
    if (!reporter) return;

    const updateMetrics = () => {
      const currentMetrics = reporter.getMetrics();
      const summary = reporter.getMetricsSummary();

      setMetrics(currentMetrics);

      // Calculate performance score
      let score = 100;
      Object.entries(summary.byMetric).forEach(
        ([metricName, data]: [string, any]) => {
          const poorCount = data.poor || 0;
          const totalCount = data.count || 1;
          const poorPercentage = (poorCount / totalCount) * 100;

          if (poorPercentage > 20) score -= 20;
          else if (poorPercentage > 10) score -= 10;
        }
      );

      setPerformanceScore(Math.max(0, score));
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2">
        <strong>Landing Page Performance</strong>
      </div>
      <div className="space-y-1">
        <div>Score: {performanceScore}/100</div>
        <div>Metrics: {metrics.length}</div>
        <div className="text-green-400">
          {metrics.filter((m) => m.name === 'LCP' && m.value < 2500).length} LCP
          Good
        </div>
        <div className="text-blue-400">
          {metrics.filter((m) => m.name === 'INP' && m.value < 200).length} INP
          Good
        </div>
        <div className="text-purple-400">
          {metrics.filter((m) => m.name === 'CLS' && m.value < 0.1).length} CLS
          Good
        </div>
      </div>
    </div>
  );
}
