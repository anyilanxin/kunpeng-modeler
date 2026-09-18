var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

// expose chai + sinon matchers as globals, matching the former
// karma-sinon-chai framework behavior.
chai.use(sinonChai);

global.expect = chai.expect;
global.sinon = sinon;
