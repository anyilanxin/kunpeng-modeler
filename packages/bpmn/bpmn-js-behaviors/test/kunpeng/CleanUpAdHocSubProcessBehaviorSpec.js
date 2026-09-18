import {
  bootstrapKunpengCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getIoMapping } from 'lib/camunda-cloud/util/InputOutputUtil';

import diagramXML from './process-adHocSubProcess.bpmn';


describe('camunda-cloud/features/modeling - CleanUpAdHocSubProcessBehavior', function() {

  beforeEach(bootstrapKunpengCloudModeler(diagramXML));


  describe('cleaning up kunpeng:AdHoc when kunpeng:TaskDefinition is added', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('AdHocSubProcess_1');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            taskDefinition = bpmnFactory.create('kunpeng:TaskDefinition');

      // when
      modeling.updateModdleProperties(element, extensionElements, {
        values: [
          ...extensionElements.get('values'),
          taskDefinition
        ]
      });
    }));


    it('should execute', function() {

      // then
      const bo = getBusinessObject(element);
      expect(bo.get('completionCondition')).to.not.exist;

      // default is true
      expect(bo.get('cancelRemainingInstances')).to.be.true;

      const adHoc = getAdHoc(element);
      expect(adHoc).to.exist;
      expect(adHoc.get('activeElementsCollection')).to.not.exist;
      expect(adHoc.get('outputCollection')).to.equal('=results');
      expect(adHoc.get('outputElement')).to.equal('result');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const bo = getBusinessObject(element);
      expect(bo.get('completionCondition').get('body')).to.equal('=all(items, item.completed)');
      expect(bo.get('cancelRemainingInstances')).to.be.false;

      const adHoc = getAdHoc(element);
      expect(adHoc).to.exist;
      expect(adHoc.get('activeElementsCollection')).to.equal('=items');
      expect(adHoc.get('outputCollection')).to.equal('=results');
      expect(adHoc.get('outputElement')).to.equal('result');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const bo = getBusinessObject(element);
      expect(bo.get('completionCondition')).to.not.exist;
      expect(bo.get('cancelRemainingInstances')).to.be.true;

      const adHoc = getAdHoc(element);
      expect(adHoc).to.exist;
      expect(adHoc.get('activeElementsCollection')).to.not.exist;
      expect(adHoc.get('outputCollection')).to.equal('=results');
      expect(adHoc.get('outputElement')).to.equal('result');
    }));

  });


  describe('removing kunpeng:additionDynamics when kunpeng:TaskDefinition is removed', function() {

    let element;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('AdHocSubProcess_3');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            taskDefinition = getTaskDefinition(element);

      // when - remove task definition
      const values = extensionElements.get('values').filter(value => value !== taskDefinition);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should execute', inject(function() {

      // then
      const additionDynamics = getAdditionDynamics(element),
            taskDefinition = getTaskDefinition(element);

      expect(taskDefinition).not.to.exist;
      expect(additionDynamics).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const additionDynamics = getAdditionDynamics(element),
            taskDefinition = getTaskDefinition(element);

      expect(taskDefinition).to.exist;
      expect(additionDynamics).to.exist;
      expect(additionDynamics.get('values')).to.have.length(1);
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const additionDynamics = getAdditionDynamics(element),
            taskDefinition = getTaskDefinition(element);

      expect(taskDefinition).not.to.exist;
      expect(additionDynamics).not.to.exist;
    }));

  });


  describe('not removing kunpeng:additionDynamics when kunpeng:IoMapping is added', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('AdHocSubProcess_3');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            ioMapping = bpmnFactory.create('kunpeng:IoMapping');

      ioMapping.$parent = extensionElements;

      // when
      const values = extensionElements.get('values').concat(ioMapping);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should NOT execute', inject(function() {

      // then
      const additionDynamics = getAdditionDynamics(element),
            ioMapping = getIoMapping(element);

      expect(additionDynamics).to.exist;
      expect(ioMapping).to.exist;
    }));

  });

});

// helpers //////////

function getAdHoc(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:AdHoc')[ 0 ];
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:TaskDefinition')[ 0 ];
}

function getAdditionDynamics(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:additionDynamics')[ 0 ];
}
