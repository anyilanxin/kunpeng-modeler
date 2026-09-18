import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import tseslint from 'typescript-eslint';

const files = {
  ignored: [ 'dist', '**/dist', 'tmp' ],
  build: [ '*.js', '*.mjs', '*.config.js', '*.config.mjs' ],
  src: [ 'src/**/*.ts' ],
  typescript: [ 'src/**/*.ts', 'test/**/*.ts' ],
  test: [ 'test/**/*.ts', 'test/**/*.js' ],
};

export default [
  {
    ignores: files.ignored,
  },

  // build
  ...bpmnIoPlugin.configs.node.map((config) => {
    return {
      ...config,
      files: files.build,
      languageOptions: {
        ...config.languageOptions,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    };
  }),

  // lib
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      files: files.src,
    };
  }),

  // TypeScript files
  ...tseslint.configs.recommended.map((config) => {
    return {
      ...config,
      files: files.typescript,
      rules: {
        ...config.rules,
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: files.test,
      rules: {
        ...config.rules,
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    };
  }),
];
