// ESLint v9 Flat Config
const globals = require('globals');

module.exports = {
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.jest
    }
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
