// Jest setup file for global test configuration
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