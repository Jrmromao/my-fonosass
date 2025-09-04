/**
 * Security Test Environment Variables
 * 
 * Sets up environment variables for security testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Mock environment variables for testing
process.env.CLERK_SECRET_KEY = 'test_clerk_secret_key';
process.env.CLERK_WEBHOOK_SECRET = 'test_clerk_webhook_secret';
process.env.STRIPE_SECRET_KEY = 'test_stripe_secret_key';
process.env.STRIPE_WEBHOOK_SECRET = 'test_stripe_webhook_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.AWS_ACCESS_KEY_ID = 'test_aws_access_key';
process.env.AWS_SECRET_ACCESS_KEY = 'test_aws_secret_key';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Security testing flags
process.env.ENABLE_SECURITY_TESTS = 'true';
process.env.SKIP_AUTH_TESTS = 'false';
process.env.SKIP_FILE_UPLOAD_TESTS = 'false';

export {};
