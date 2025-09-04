/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1', // Map @/ to project root
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
            tsconfig: 'tsconfig.json',
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/__tests__/setup/', '/__tests__/security/'],
    testMatch: [
        '<rootDir>/__tests__/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/services/**/*.test.{js,jsx,ts,tsx}',
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.js'],
    verbose: true,
};
