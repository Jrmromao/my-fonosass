'use client';

import { initWebVitals, type WebVitalsConfig } from '@/lib/web-vitals';
import { useEffect } from 'react';

interface WebVitalsTrackerProps {
  config?: WebVitalsConfig;
}

export default function WebVitalsTracker({ config }: WebVitalsTrackerProps) {
  useEffect(() => {
    // Initialize web vitals tracking
    try {
      initWebVitals({
        debug: process.env.NODE_ENV === 'development',
        reportToGoogleAnalytics: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        reportToVercelAnalytics: true,
        customEndpoint: '/api/web-vitals',
        sampleRate: 1.0, // Track all users in development, consider reducing in production
        ...config,
      });
    } catch (error) {
      console.warn(
        '[WebVitalsTracker] Failed to initialize web vitals:',
        error
      );
    }
  }, [config]);

  // This component doesn't render anything
  return null;
}
