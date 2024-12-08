module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'next/core-web-vitals',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Permite o uso de 'any'
        '@typescript-eslint/no-unused-vars': 'off', // Permite variáveis não utilizadas
        '@typescript-eslint/no-var-requires': 'off', // Permite o uso de 'require'
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        'no-empty': 'off', // Disables the rule globally

    },
};
