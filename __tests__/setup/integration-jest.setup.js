/**
 * Integration Test Jest Setup
 * 
 * Sets up Jest environment for integration tests (API routes)
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test-access-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'
process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
process.env.CLERK_SECRET_KEY = 'test-clerk-secret-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment the lines below to see console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Global test timeout
jest.setTimeout(10000)

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks()
})
