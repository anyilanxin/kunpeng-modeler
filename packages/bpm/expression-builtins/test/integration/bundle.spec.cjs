const { kunpengBuiltins } = require('@kunpeng/expression-builtins');

const { expect } = require('chai');


describe('integration - bundle', function() {

  it('should export CJS export', async function() {

    // then
    expect(kunpengBuiltins).not.to.be.empty;
  });

});
