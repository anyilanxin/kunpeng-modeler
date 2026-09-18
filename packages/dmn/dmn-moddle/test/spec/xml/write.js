'use strict';

var assign = require('min-dash').assign,
    isFunction = require('min-dash').isFunction;

var Helper = require('../../helper');


describe('write', function() {

  var moddle = Helper.createModdle();


  async function write(element, options, callback) {
    if (isFunction(options)) {
      callback = options;
      options = {};
    }

    // skip preamble for tests
    options = assign({ preamble: false }, options);

    const { xml } = await moddle.toXML(element, options);

    return xml;
  }


  describe('should export properties', function() {

    it('kunpeng:VersionTag', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:VersionTag', {
        value: 'v1.0.0'
      });

      const expectedXML = '<kunpeng:versionTag ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'value="v1.0.0" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });

  });

});
