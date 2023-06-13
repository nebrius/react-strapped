module.exports = {
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'prettier',
        'react',
        'react-hooks',
    ],
    rules: {
        // General rules
        'prettier/prettier': 'error',
        'import/order': [
            'error',
            {
                groups: ['external', 'internal'],
                'newlines-between': 'always-and-inside-groups',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: false,
                },
            },
        ],
        'import/no-cycle': 'error',
        'no-debugger': 'error',
        radix: 'error',
        'spaced-comment': 'error',
        'use-isnan': 'error',

        // React rules
        'react/jsx-boolean-value': ['error', 'never'],
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',

        // Is currently broken, see https://github.com/vercel/next.js/pull/40331
        'react/no-unknown-property': 'off',

        // TypeScript rules
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/ban-types': [
            2,
            {
                extendDefaults: true,
                types: {
                    object: '`object` actually means "any non-primitive type".',
                },
            },
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': [
            'error',
            'interface',
        ],
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports'
            }
        ],
        // We disable this because it's customary to leave out the return type
        // of a `render` method. We might reconsider re-enabling this if and
        // when class components are done away.
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                overrides: {
                    constructors: 'no-public',
                },
            },
        ],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-invalid-this': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/unified-signatures': 'error',

        // Custom rules found in the eslint-local-rules directory

        // Not needed in Next.js
        'react/react-in-jsx-scope': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}
