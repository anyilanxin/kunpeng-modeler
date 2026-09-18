import { expect } from 'chai';

import {
  kunpengBuiltins,
  qlexpressionBuiltins,
  kunpengExtensions,
  kunpengReservedNameBuiltins
} from '@kunpeng/expression-builtins';


describe('kunpengBuiltins', function() {

  it('should export ALL builtins', function() {

    // testing if the count of builtin changes, if it does we have
    // to adjust from chore to feat and do a minor release

    // then
    expect(kunpengBuiltins).to.be.an('array').with.length(136);
    expect(kunpengReservedNameBuiltins).to.be.an('array').with.length(1);
  });


  it('should export qlexpressionBuiltins', function() {

    // then
    expectBuiltin(qlexpressionBuiltins, 'not');
  });


  it('should export kunpengExtensions', function() {

    // then
    expectBuiltin(kunpengExtensions, 'get or else');
  });


  it('should export kunpengReservedNameBuiltins', function() {

    // then
    expectBuiltin(kunpengReservedNameBuiltins, 'get or else');
  });


  it('should export kunpengBuiltins', function() {

    // then
    expect(kunpengBuiltins).to.have.length(qlexpressionBuiltins.length + kunpengExtensions.length);
  });


  it('should export parameterized builtin', function() {

    // then
    expectBuiltinProperties(kunpengBuiltins, 'get or else', {
      name: 'get or else',
      type: 'function',
      params: [ { name: 'value' }, { name: 'default' } ],
    });
  });


  it('should export parameterless builtin', function() {

    // then
    expectBuiltinProperties(kunpengBuiltins, 'random number', {
      name: 'random number',
      type: 'function',
      params: []
    });
  });

});


// helpers /////////

/**
 * @param {import('@kunpeng/expression-builtins').Builtin[]} builtins
 * @param {string} name
 *
 * @return {import('@kunpeng/expression-builtins').Builtin}
 */
function expectBuiltin(builtins, name) {
  const builtin = builtins.find(builtin => builtin.name === name);

  if (!builtin) {
    throw expect(builtin, `builtin with name <${name}>`).to.exist;
  }

  return builtin;
}

/**
 * @param {import('@kunpeng/expression-builtins').Builtin[]} builtins
 * @param {string} name
 *
 * @param {Record<string, any>} expectedProperties
 */
function expectBuiltinProperties(builtins, name, expectedProperties) {
  const builtin = expectBuiltin(builtins, name);

  expect(builtin).to.deep.include(expectedProperties);
  expect(builtin).to.have.property('info');
}
