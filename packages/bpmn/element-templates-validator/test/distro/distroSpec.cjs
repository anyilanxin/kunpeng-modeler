const {
  expect
} = require('chai');


describe('validate module', function() {

  it('should expose CJS bundle', function() {

    // given
    const {
      validate,
      validateAll,
      getSchemaVersion,
      validateKunpeng,
      validateAllKunpeng,
      getKunpengSchemaVersion
    } = require('../..');

    // then
    expect(validate).to.exist;
    expect(validateAll).to.exist;
    expect(getSchemaVersion).to.exist;
    expect(validateKunpeng).to.exist;
    expect(validateAllKunpeng).to.exist;
    expect(getKunpengSchemaVersion).to.exist;
  });
});
