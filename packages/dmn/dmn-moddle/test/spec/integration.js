'use strict';

var DmnModdle = require('dmn-moddle');

var zeebeDescriptor = require('../../resources/zeebe');


describe('exports', function() {

  it('should extend dmn-moddle', function() {

    // given
    var moddle = new DmnModdle({
      kunpeng: zeebeDescriptor
    });

    // when
    // then
    expect(() => moddle.create('kunpeng:VersionTag')).not.to.throw();
  });

});