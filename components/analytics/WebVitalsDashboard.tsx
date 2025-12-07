'use client';

import { Badge } from '@/components/ui/badge';
import { WEB_VITALS_THRESHOLDS, getMetricRating } from '@/lib/web-vitals-utils';
import { Activity, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsDashboardProps {
  className?: string;
}

export default function WebVitalsDashboard({
  className,
}: WebVitalsDashboardProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === 'development' ||
      localStorage.getItem('web-vitals-debug') === 'true';

    if (!shouldShow) return;

    // Listen for custom Web Vitals events
    const handleWebVitals = (event: CustomEvent) => {
      const metric = event.detail;
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== metric.name), // Remove existing metric of same type
        {
          name: metric.name,
          value: metric.value,
          rating: getMetricRating(metric.name, metric.value),
          timestamp: Date.now(),
        },
      ]);
    };

    window.addEventListener(
      'web-vitals-metric',
      handleWebVitals as EventListener
    );

    return () => {
      window.removeEventListener(
        'web-vitals-metric',
        handleWebVitals as EventListener
      );
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const thresholds = WEB_VITALS_THRESHOLDS;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'LCP':
      case 'FCP':
      case 'INP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const getMetricDescription = (name: string) => {
    const descriptions = {
      LCP: 'Largest Contentful Paint - Time to render the largest content element',
      INP: 'Interaction to Next Paint - Responsiveness to user interactions',
      CLS: 'Cumulative Layout Shift - Visual stability measure',
      FCP: 'First Contentful Paint - Time to first content render',
      TTFB: 'Time to First Byte - Server response time',
    };
    return descriptions[name as keyof typeof descriptions] || '';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Toggle Web Vitals dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Web Vitals Monitor
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close Web Vitals dashboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Real-time Core Web Vitals metrics
            </p>
          </div>

          <div className="p-4 space-y-3">
            {metrics.length === 0 ? (
              <p className="text-xs text-gray-500">No metrics recorded yet</p>
            ) : (
              metrics.map((metric) => {
                const threshold =
                  thresholds[metric.name as keyof typeof thresholds];
                return (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{metric.name}</span>
                      <Badge
                        className={`text-xs ${getRatingColor(metric.rating)}`}
                      >
                        {metric.rating.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>Value: {formatValue(metric.name, metric.value)}</div>
                      {threshold && (
                        <div className="text-xs text-gray-400">
                          Good: {formatValue(metric.name, threshold.good)} |
                          Needs improvement:{' '}
                          {formatValue(metric.name, threshold.needsImprovement)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {getMetricDescription(metric.name)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
