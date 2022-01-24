'use strict'

module.exports = {
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  extends: [
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import', 'jest', 'prettier'],
  env: {
    'es6': true,
    'browser': true,
    'jest/globals': true,
  },
  rules: {
    'prettier/prettier': 'error',
    // 'prettier/prettier': 'off',
    'import/no-unresolved': 'error',
    // '@typescript-eslint/member-delimiter-style': ['error', {
    //   "multiline": { "delimiter": "comma", "requireLast": true },
    //   "singleline": { "delimiter": "comma", "requireLast": false },
    //   "multilineDetection": "last-member",
    // }],
  },
}
