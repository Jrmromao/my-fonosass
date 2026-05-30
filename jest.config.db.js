const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.db.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.docker.test.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
  roots: ['<rootDir>/__tests__/integration'],
  automock: false,
  modulePathIgnorePatterns: ['<rootDir>/__mocks__'],
};

module.exports = createJestConfig(customJestConfig);
