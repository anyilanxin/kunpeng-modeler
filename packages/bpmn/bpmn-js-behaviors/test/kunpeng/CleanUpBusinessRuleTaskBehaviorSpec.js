import {
  bootstrapKunpengCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getIoMapping } from 'lib/camunda-cloud/util/InputOutputUtil';

import diagramXML from './process-businessRuleTask.bpmn';


describe('camunda-cloud/features/modeling - CleanUpBusinessRuleTaskBehavior', function() {

  beforeEach(bootstrapKunpengCloudModeler(diagramXML));


  describe('removing kunpeng:CalledDecision when kunpeng:TaskDefinition is added', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTask_1');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            taskDefinition = bpmnFactory.create('kunpeng:TaskDefinition', { });

      taskDefinition.$parent = extensionElements;

      // when
      const values = extensionElements.get('values').concat(taskDefinition);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should execute', function() {

      // then
      const calledDecision = getCalledDecision(element);

      expect(calledDecision).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const calledDecision = getCalledDecision(element);

      expect(calledDecision).to.exist;
      expect(calledDecision.decisionId).to.equal('a');
      expect(calledDecision.resultVariable).to.equal('b');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const calledDecision = getCalledDecision(element);

      expect(calledDecision).not.to.exist;
    }));

  });


  describe('removing kunpeng:TaskDefinition when kunpeng:CalledDecision is added', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTask_2');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            calledDecision = bpmnFactory.create('kunpeng:CalledDecision', { });

      calledDecision.$parent = extensionElements;

      // when
      const values = extensionElements.get('values').concat(calledDecision);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should execute', inject(function() {

      // then
      const taskDefiniton = getTaskDefinition(element);

      expect(taskDefiniton).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const taskDefiniton = getTaskDefinition(element);

      expect(taskDefiniton).to.exist;
      expect(taskDefiniton.type).to.equal('a');
      expect(taskDefiniton.retries).to.equal('b');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const taskDefiniton = getTaskDefinition(element);

      expect(taskDefiniton).not.to.exist;
    }));

  });


  describe('removing kunpeng:additionDynamics when kunpeng:CalledDecision is added', function() {

    let element;

    beforeEach(inject(function(commandStack, elementRegistry, bpmnFactory, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTask_3');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            calledDecision = bpmnFactory.create('kunpeng:CalledDecision', { });

      calledDecision.$parent = extensionElements;

      // when
      const values = extensionElements.get('values').concat(calledDecision);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should execute', inject(function() {

      // then
      const additionDynamics = getAdditionDynamics(element);

      expect(additionDynamics).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const additionDynamics = getAdditionDynamics(element);

      expect(additionDynamics).to.exist;
      expect(additionDynamics.get('values')).to.have.length(1);
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const additionDynamics = getAdditionDynamics(element);

      expect(additionDynamics).not.to.exist;
    }));

  });


  describe('not removing kunpeng:additionDynamics when kunpeng:IoMapping is added', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTask_3');

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

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:CalledDecision')[ 0 ];
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:TaskDefinition')[ 0 ];
}

function getAdditionDynamics(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'kunpeng:additionDynamics')[ 0 ];
}
