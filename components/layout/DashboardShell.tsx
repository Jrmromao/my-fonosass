'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ViewAsBanner } from '@/components/layout/ViewAsBanner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/** Signed-in app frame: sidebar + content, with the shared query client. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* overflow-x-clip, not -hidden: hidden makes these boxes scroll
          containers, which breaks position: sticky in the pages. */}
      <div className="flex min-h-screen bg-violet-100 text-neutral-900 overflow-x-clip">
        <Sidebar />
        <main className="flex-1 overflow-x-clip min-w-0">
          <ViewAsBanner />
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}
