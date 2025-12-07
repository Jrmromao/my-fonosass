/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1', // Map @/ to project root
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/services/(.*)$': '<rootDir>/services/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
        '^server-only$': '<rootDir>/__tests__/setup/server-only-mock.js',
        '^@aws-sdk/client-s3$': '<rootDir>/__tests__/setup/aws-sdk-mock.js',
        '^@aws-sdk/lib-storage$': '<rootDir>/__tests__/setup/aws-sdk-mock.js',
        '^@clerk/nextjs$': '<rootDir>/__tests__/setup/clerk-mock.js',
        '^@clerk/nextjs/server$': '<rootDir>/__tests__/setup/clerk-mock.js',
        '^next/server$': '<rootDir>/__tests__/setup/next-server-mock.js',
    },
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
            ],
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@clerk|json2csv|@radix-ui|@tanstack|framer-motion|react-beautiful-dnd|@react-pdf|@aws-sdk))',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/__tests__/setup/'],
    testMatch: [
        '<rootDir>/__tests__/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/security/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/services/**/*.test.{js,jsx,ts,tsx}',
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.js'],
    collectCoverageFrom: [
        'services/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/__tests__/**',
        '!**/migrations/**',
        '!**/prisma/**',
        '!**/app/**', // Exclude app directory from coverage
        '!**/components/**', // Exclude components directory from coverage for now
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
        './services/': {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60,
        },
        './hooks/': {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60,
        },
    },
    verbose: true,
    testTimeout: 10000,
};