'use strict';


var readFile = require('../../helper').readFile,
    createModdle = require('../../helper').createModdle;


describe('read', function() {

  describe('should read extensions', function() {

    var moddle;

    beforeEach(function() {
      moddle = createModdle();
    });


    describe('kunpeng:VersionTag', function() {

      it('on Decision', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-versionTag.part.dmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'dmn:Decision');

        // then
        expect(task).to.jsonEqual({
          $type: 'dmn:Decision',
          id: 'Decision_1',
          name: 'Decision 1',
          extensionElements: {
            $type: 'dmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:VersionTag',
                value: 'v1.0.0'
              }
            ]
          }
        });
      });

    });

  });

});
