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
        '^.+\\.(js|jsx)$': ['babel-jest', {
            presets: ['@babel/preset-env', '@babel/preset-react'],
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@clerk|json2csv))',
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
    verbose: true,
};