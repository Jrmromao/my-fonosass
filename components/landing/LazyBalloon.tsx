'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, lazy } from 'react';

// Lazy load the balloon component
const BalloonOptimizedMinimal = lazy(
  () => import('@/components/Balloon/BalloonOptimizedMinimal')
);

export default function LazyBalloon() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <Skeleton className="w-64 h-64 rounded-full" />
        </div>
      }
    >
      <BalloonOptimizedMinimal />
    </Suspense>
  );
}
