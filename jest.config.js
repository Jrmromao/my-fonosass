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
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],
    verbose: true,
};