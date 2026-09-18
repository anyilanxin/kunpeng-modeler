'use strict';

var fs = require('fs');


function readFile(filename) {
  return fs.readFileSync(filename, { encoding: 'UTF-8' });
}

module.exports.readFile = readFile;


var DmnModdle = require('dmn-moddle');

var zeebeDescriptor = require('../resources/zeebe');

function createModdle() {
  return new DmnModdle({
    kunpeng: zeebeDescriptor
  });
}

module.exports.createModdle = createModdle;