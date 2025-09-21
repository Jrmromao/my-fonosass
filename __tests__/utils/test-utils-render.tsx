import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React, { ReactElement } from 'react';

// Mock Clerk provider for testing
const MockClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider
    publishableKey="pk_test_mock_key"
    afterSignInUrl="/dashboard"
    afterSignUpUrl="/dashboard"
  >
    {children}
  </ClerkProvider>
);

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <MockClerkProvider>
          {children}
        </MockClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
