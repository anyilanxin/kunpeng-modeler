const fs = require('fs');

const compileConfig = require('bpmnlint/lib/support/compile-config');

const config = {
  extends: [ 'plugin:@kunpeng/bpmnlint-plugin-kunpeng-compat/all', 'bpmnlint:correctness' ]
};

compileConfig(config).then(code => fs.writeFileSync('lib/compiled-config.js', code));