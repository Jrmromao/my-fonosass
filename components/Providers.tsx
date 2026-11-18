'use client';

import '@/lib/i18n'; // Initialize i18n
import '@/lib/zodConfig'; // zod without eval (CSP)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    // No ThemeProvider: the app is light-only (nothing calls useTheme and no
    // CSS targets the class it added), and it rendered an inline script on
    // every page that the signed-in area's nonce CSP would block.
    // components/theme-provider.tsx is kept if theming is added later.
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
