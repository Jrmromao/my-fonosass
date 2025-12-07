// Web Vitals utility functions

export const enableWebVitalsDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('web-vitals-debug', 'true');
    window.location.reload();
  }
};

export const disableWebVitalsDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('web-vitals-debug');
    window.location.reload();
  }
};

export const isWebVitalsDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('web-vitals-debug') === 'true';
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).webVitals = {
    enableDebug: enableWebVitalsDebug,
    disableDebug: disableWebVitalsDebug,
    isDebugEnabled: isWebVitalsDebugEnabled,
  };
}

// Web Vitals thresholds based on Google's recommendations
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 }, // INP replaces FID
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

// Get rating for a metric value
export const getMetricRating = (
  metricName: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = WEB_VITALS_THRESHOLDS[metricName];

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

// Format metric value for display
export const formatMetricValue = (
  metricName: string,
  value: number
): string => {
  switch (metricName) {
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

// Get metric description
export const getMetricDescription = (metricName: string): string => {
  const descriptions: Record<string, string> = {
    LCP: 'Largest Contentful Paint - Time to render the largest content element',
    INP: 'Interaction to Next Paint - Responsiveness to user interactions',
    CLS: 'Cumulative Layout Shift - Visual stability measure',
    FCP: 'First Contentful Paint - Time to first content render',
    TTFB: 'Time to First Byte - Server response time',
  };
  return descriptions[metricName] || '';
};
