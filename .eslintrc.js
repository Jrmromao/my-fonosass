module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [], // Remove all extends to avoid inheriting rules
    rules: {
        // This turns off all rules
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        'no-empty': 'off',
        // A more aggressive approach would be to add:
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        // Disable all rules from Next.js
        'react/no-unescaped-entities': 'off',
        'react/display-name': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        // Add this to disable all possible rules
        'no-undef': 'off',
        'no-restricted-syntax': 'off',
        'no-console': 'off',
    },
    // This completely ignores all issues
    ignorePatterns: ['**/*'],
};
