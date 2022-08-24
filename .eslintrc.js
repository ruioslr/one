const path = require('path');
const resolve = (_path) => path.resolve(__dirname, _path);
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: '@typescript-eslint/parser', // 配置ts解析器
  parserOptions: {
    project: resolve('./tsconfig.json'),
    tsconfigRootDir: resolve('./'),
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Your TypeScript files extension

      // As mentioned in the comments, you should extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],

      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
    },
  ],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-unused-vars': 'off',
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
