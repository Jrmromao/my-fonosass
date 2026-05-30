const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.db.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.docker.test.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
