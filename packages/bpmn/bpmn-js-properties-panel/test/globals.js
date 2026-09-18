import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Expose chai + sinon + sinon-chai matchers as globals, matching the former
// karma-sinon-chai framework behavior.
chai.use(sinonChai);

// Register the custom jsonEqual assertion (previously set up in TestHelper.js
// via global.chai.use).
chai.use(function(_chai, utils) {
  utils.addMethod(_chai.Assertion.prototype, 'jsonEqual', function(comparison) {
    var actual = JSON.stringify(this._obj);
    var expected = JSON.stringify(comparison);

    this.assert(
      actual === expected,
      'expected #{this} to deep equal #{act}',
      'expected #{this} not to deep equal #{act}',
      comparison, // expected
      this._obj, // actual
      true // show diff
    );
  });
});

global.chai = chai;
global.expect = chai.expect;
global.sinon = sinon;
