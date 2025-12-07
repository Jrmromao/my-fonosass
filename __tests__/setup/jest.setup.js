// Jest setup file for global test configuration
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key';
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/sign-in';
process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/sign-up';
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = '/dashboard';
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = '/dashboard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'pt-BR',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Prisma - basic setup, individual tests can override specific methods
jest.mock('@/app/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    downloadLimit: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    downloadHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    download: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    activity: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// DownloadLimitService mocking is handled in individual test files

// Mock json2csv
jest.mock('json2csv', () => ({
  parse: jest.fn((data) => 'mocked,csv,data'),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
      return response;
    }),
  },
}));

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});
