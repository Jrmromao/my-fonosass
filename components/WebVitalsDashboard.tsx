'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getWebVitalsReporter, type WebVitalsMetric } from '@/lib/web-vitals';
import {
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WebVitalsDashboardProps {
  className?: string;
}

export default function WebVitalsDashboard({
  className,
}: WebVitalsDashboardProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMetrics = () => {
    const reporter = getWebVitalsReporter();
    if (reporter) {
      const currentMetrics = reporter.getMetrics();
      const currentSummary = reporter.getMetricsSummary();
      setMetrics(currentMetrics);
      setSummary(currentSummary);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshMetrics();

    // Refresh every 5 seconds
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <TrendingUp className="h-4 w-4" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4" />;
      case 'poor':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'INP':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toFixed(2);
    }
  };

  const getThresholds = (name: string) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      INP: { good: 200, poor: 500 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };
    return thresholds[name as keyof typeof thresholds] || { good: 0, poor: 0 };
  };

  const getProgressValue = (name: string, value: number) => {
    const thresholds = getThresholds(name);
    const maxValue = thresholds.poor * 1.5; // Extend beyond poor threshold
    return Math.min((value / maxValue) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Web Vitals Dashboard</CardTitle>
          <CardDescription>Loading performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Web Vitals Dashboard</CardTitle>
          <CardDescription>No metrics collected yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>
              Web vitals will appear here once users start interacting with your
              app.
            </p>
            <Button onClick={refreshMetrics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Web Vitals Dashboard</CardTitle>
            <CardDescription>
              Real-time performance metrics ({summary.total} total measurements)
            </CardDescription>
          </div>
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(summary.byMetric).map(
            ([metricName, data]: [string, any]) => {
              const thresholds = getThresholds(metricName);
              const rating =
                data.good > data.needsImprovement + data.poor
                  ? 'good'
                  : data.needsImprovement > data.poor
                    ? 'needs-improvement'
                    : 'poor';

              return (
                <Card key={metricName}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{metricName}</span>
                      <Badge
                        variant="outline"
                        className={getRatingColor(rating)}
                      >
                        {getRatingIcon(rating)}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {formatValue(metricName, data.average)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg of {data.count} measurements
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={getProgressValue(metricName, data.average)}
                        className="h-2"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        Good: &lt;{formatValue(metricName, thresholds.good)}
                      </span>
                      <span>
                        Poor: &gt;{formatValue(metricName, thresholds.poor)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summary.byMetric).map(
              ([metricName, data]: [string, any]) => (
                <Card key={metricName}>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">
                      {metricName} Distribution
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">Good</span>
                        <span className="text-sm font-medium">{data.good}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-600">
                          Needs Improvement
                        </span>
                        <span className="text-sm font-medium">
                          {data.needsImprovement}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600">Poor</span>
                        <span className="text-sm font-medium">{data.poor}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>

        {/* Recent Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Metrics</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {summary.recent
                .slice(-10)
                .reverse()
                .map((metric: WebVitalsMetric, index: number) => {
                  const rating =
                    metric.value <= getThresholds(metric.name).good
                      ? 'good'
                      : metric.value <= getThresholds(metric.name).poor
                        ? 'needs-improvement'
                        : 'poor';

                  return (
                    <div
                      key={`${metric.id}-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={getRatingColor(rating)}
                        >
                          {metric.name}
                        </Badge>
                        <span className="font-mono text-sm">
                          {formatValue(metric.name, metric.value)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {rating.replace('-', ' ')}
                        </Badge>
                        {metric.viewport && (
                          <span className="text-xs text-muted-foreground">
                            {metric.viewport.width}×{metric.viewport.height}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
