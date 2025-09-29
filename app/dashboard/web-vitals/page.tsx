import WebVitalsDashboard from '@/components/WebVitalsDashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Suspense } from 'react';

export default function WebVitalsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Web Vitals Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your app's Core Web Vitals performance in real-time
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <Card>
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
        }
      >
        <WebVitalsDashboard />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Understanding Web Vitals</CardTitle>
          <CardDescription>
            Core Web Vitals are the key metrics that measure user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">
                LCP (Largest Contentful Paint)
              </h3>
              <p className="text-sm text-muted-foreground">
                Measures loading performance. Good: &lt;2.5s, Poor: &gt;4s
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">
                INP (Interaction to Next Paint)
              </h3>
              <p className="text-sm text-muted-foreground">
                Measures interactivity. Good: &lt;200ms, Poor: &gt;500ms
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">
                CLS (Cumulative Layout Shift)
              </h3>
              <p className="text-sm text-muted-foreground">
                Measures visual stability. Good: &lt;0.1, Poor: &gt;0.25
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">
                FCP (First Contentful Paint)
              </h3>
              <p className="text-sm text-muted-foreground">
                Measures loading performance. Good: &lt;1.8s, Poor: &gt;3s
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2">
                TTFB (Time to First Byte)
              </h3>
              <p className="text-sm text-muted-foreground">
                Measures server response time. Good: &lt;800ms, Poor: &gt;1.8s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
