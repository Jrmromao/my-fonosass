# Web Vitals Implementation

This document describes the Web Vitals monitoring implementation for the FonoSaaS application.

## Overview

Web Vitals are essential metrics that measure user experience on your website. Google uses these metrics for search ranking, and they help identify performance issues that affect user experience.

## Core Web Vitals Tracked

1. **LCP (Largest Contentful Paint)** - Time to render the largest content element
2. **INP (Interaction to Next Paint)** - Responsiveness to user interactions (replaces FID)
3. **CLS (Cumulative Layout Shift)** - Visual stability measure
4. **FCP (First Contentful Paint)** - Time to first content render
5. **TTFB (Time to First Byte)** - Server response time

## Implementation Components

### 1. WebVitals Component (`/components/analytics/WebVitals.tsx`)

- Tracks all Core Web Vitals metrics
- Sends data to Google Analytics
- Sends data to custom API endpoint
- Dispatches custom events for dashboard
- Provides console logging in development

### 2. WebVitalsDashboard Component (`/components/analytics/WebVitalsDashboard.tsx`)

- Real-time monitoring dashboard
- Shows current metric values and ratings
- Only visible in development or when debug mode is enabled
- Displays metric descriptions and thresholds

### 3. API Endpoint (`/app/api/analytics/web-vitals/route.ts`)

- Receives Web Vitals data from client
- Logs metrics for analysis
- Can be extended to store in database

### 4. Utility Functions (`/lib/web-vitals-utils.ts`)

- Metric rating calculations
- Value formatting
- Debug mode controls
- Threshold definitions

## Usage

### Automatic Tracking

Web Vitals are automatically tracked on all pages through the root layout:

```tsx
<WebVitals 
  analyticsId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
  debug={process.env.NODE_ENV === 'development'}
/>
<WebVitalsDashboard />
```

### Debug Mode

To enable Web Vitals debugging in production:

```javascript
// In browser console
window.webVitals.enableDebug();
```

To disable:

```javascript
window.webVitals.disableDebug();
```

### Google Analytics Integration

Web Vitals are automatically sent to Google Analytics with the following event structure:

- **Event Name**: Metric name (LCP, INP, CLS, FCP, TTFB)
- **Event Category**: "Web Vitals"
- **Event Label**: Unique metric ID
- **Value**: Metric value (rounded)
- **Custom Parameters**:
  - `rating`: good/needs-improvement/poor
  - `delta`: Change from previous measurement

## Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| LCP    | ≤2.5s | ≤4.0s | >4.0s |
| INP    | ≤200ms | ≤500ms | >500ms |
| CLS    | ≤0.1 | ≤0.25 | >0.25 |
| FCP    | ≤1.8s | ≤3.0s | >3.0s |
| TTFB   | ≤800ms | ≤1.8s | >1.8s |

## Monitoring

### Development

- Console logging shows all metrics
- Dashboard component displays real-time metrics
- Custom events for debugging

### Production

- Data sent to Google Analytics
- Data sent to custom API endpoint
- Dashboard can be enabled via localStorage

## Custom Analytics

To extend the Web Vitals tracking:

1. Modify `/app/api/analytics/web-vitals/route.ts` to store data in your database
2. Add additional analytics providers in `WebVitals.tsx`
3. Create custom dashboards using the dispatched events

## Best Practices

1. **Monitor Regularly**: Check Web Vitals in Google Search Console
2. **Set Alerts**: Configure alerts for poor performance
3. **Optimize Continuously**: Use metrics to guide performance improvements
4. **Test on Real Devices**: Web Vitals vary by device and network conditions

## Troubleshooting

### Dashboard Not Showing

1. Check if debug mode is enabled: `localStorage.getItem('web-vitals-debug')`
2. Enable debug mode: `window.webVitals.enableDebug()`

### Metrics Not Appearing

1. Check browser console for errors
2. Verify Google Analytics is properly configured
3. Check network tab for API calls to `/api/analytics/web-vitals`

### Performance Impact

The Web Vitals implementation is designed to have minimal performance impact:
- Uses efficient event listeners
- Batches API calls
- Only tracks essential metrics
- Minimal DOM manipulation

## Related Documentation

- [Google Web Vitals](https://web.dev/vitals/)
- [Google Search Console](https://search.google.com/search-console)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
