'use client';

import { Sidebar } from '@/components/layout/Sidebar';
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
      <div className="flex min-h-screen bg-background overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
