import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  build: [ '*.js', '*.mjs', '*.config.js', '*.config.mjs' ],
  test: [ 'test/**/*.js' ]
};

export default [
  {
    ignores: [
      'dist',
      '.nyc_output',
      'coverage'
    ]
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: files.build,
      languageOptions: {
        ...config.languageOptions,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    };
  }),

  // lib
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: files.test
    };
  })
];
