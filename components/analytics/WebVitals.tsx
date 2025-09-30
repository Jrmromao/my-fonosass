'use client';

import { formatMetricValue, getMetricRating } from '@/lib/web-vitals-utils';
import { useEffect } from 'react';
import { Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsProps {
  analyticsId?: string;
  debug?: boolean;
}

export default function WebVitals({
  analyticsId,
  debug = false,
}: WebVitalsProps) {
  useEffect(() => {
    // Function to send metrics to Google Analytics
    const sendToGoogleAnalytics = (metric: Metric) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const rating = getMetricRating(metric.name as any, metric.value);
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          non_interaction: true,
          custom_parameter_rating: rating,
          custom_parameter_delta: Math.round(metric.delta),
        });
      }
    };

    // Function to send metrics to custom analytics endpoint
    const sendToCustomAnalytics = async (metric: Metric) => {
      try {
        await fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
            navigationType: metric.navigationType,
            rating: metric.rating,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        });
      } catch (error) {
        if (debug) {
          console.error(
            'Failed to send Web Vitals to custom analytics:',
            error
          );
        }
      }
    };

    // Function to log metrics for debugging
    const logMetric = (metric: Metric) => {
      if (debug) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      }
    };

    // Function to dispatch custom event for dashboard
    const dispatchCustomEvent = (metric: Metric) => {
      if (typeof window !== 'undefined') {
        const customEvent = new CustomEvent('web-vitals-metric', {
          detail: {
            ...metric,
            rating: getMetricRating(metric.name as any, metric.value),
            formattedValue: formatMetricValue(metric.name, metric.value),
          },
        });
        window.dispatchEvent(customEvent);
      }
    };

    // Function to handle metric reporting
    const handleMetric = (metric: Metric) => {
      logMetric(metric);
      sendToGoogleAnalytics(metric);
      sendToCustomAnalytics(metric);
      dispatchCustomEvent(metric);
    };

    // Track Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric); // INP replaces FID as a Core Web Vital
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Additional metrics for comprehensive monitoring
    if (debug) {
      console.log('[Web Vitals] Monitoring initialized');
    }
  }, [analyticsId, debug]);

  return null; // This component doesn't render anything
}
