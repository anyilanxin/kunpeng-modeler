'use strict';

var readFile = require('../../helper').readFile,
    createModdle = require('../../helper').createModdle;


describe('import -> export roundtrip', function() {

  function stripSpaces(xml) {
    return xml.replace(/\n|\r/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s\/>/g, '/>')
      .replace(/>\s+</g, '><');
  }

  function validateExport(file) {

    return async function() {

      // given
      var xml = readFile(file);

      var moddle = createModdle();

      // when
      const {
        rootElement: definitions,
        warnings
      } = await moddle.fromXML(xml, 'bpmn:Definitions');

      // then
      expect(warnings).to.be.empty;

      // but when
      const {
        xml: savedXML
      } = await moddle.toXML(definitions);

      // then
      expect(stripSpaces(savedXML)).to.eql(stripSpaces(xml));
    };
  }


  describe('Zeebe properties', function() {

    it('should keep Zeebe properties', validateExport('test/fixtures/xml/simple.bpmn'));

  });


  it('should keep kunpeng:properties', validateExport('test/fixtures/xml/zeebe-properties.bpmn'));


  it('should keep kunpeng:modelerTemplate', validateExport('test/fixtures/xml/rootElement.bpmn'));


  describe('kunpeng:UserTask', function() {

    it('should keep kunpeng:formDefinition properties', validateExport('test/fixtures/xml/userTask-zeebe-formDefinition.bpmn'));

  });


  describe('kunpeng:ExecutionListeners', function() {

    it('should keep kunpeng:executionListeners', validateExport('test/fixtures/xml/zeebe-execution-listeners.bpmn'));

  });


  describe('kunpeng:VersionTag', function() {

    it('should keep kunpeng:versionTag', validateExport('test/fixtures/xml/zeebe-versionTag.bpmn'));

  });


  describe('kunpeng:BindingTypeSupported', function() {

    it('should keep kunpeng:bindingType', validateExport('test/fixtures/xml/zeebe-bindingType.bpmn'));

  });


  describe('kunpeng:TaskListeners', function() {

    it('should keep kunpeng:taskListeners', validateExport('test/fixtures/xml/zeebe-taskListeners.bpmn'));

  });


  describe('kunpeng:LinkedResource', function() {

    it('should keep kunpeng:linkedResource', validateExport('test/fixtures/xml/zeebe-linkedResources.bpmn'));

  });


  describe('kunpeng:AdHoc', function() {

    it('should keep kunpeng:adHoc', validateExport('test/fixtures/xml/zeebe-adHoc.bpmn'));

  });


  describe('kunpeng:ConditionalFilter', function() {

    it('should keep kunpeng:conditionalFilter', validateExport('test/fixtures/xml/zeebe-conditionalFilter.bpmn'));

  });

});
