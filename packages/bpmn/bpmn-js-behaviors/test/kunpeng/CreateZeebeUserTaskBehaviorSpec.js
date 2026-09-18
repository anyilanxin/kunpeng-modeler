import { bootstrapKunpengCloudModeler, inject } from 'test/TestHelper';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'min-dash';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';


import emptyProcessDiagramXML from './process-empty.bpmn';
import userTasksXML from './process-user-tasks.bpmn';

describe('camunda-cloud/features/modeling - CreateKunpengUserTaskBehavior', function() {

  describe('when a shape is created', function() {

    beforeEach(bootstrapKunpengCloudModeler(emptyProcessDiagramXML));


    it('should execute when creating bpmn:UserTask', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:UserTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            zeebeUserTaskExtensions = getExtensionElementsList(businessObject, 'kunpeng:UserTask');

      expect(zeebeUserTaskExtensions).to.exist;
      expect(zeebeUserTaskExtensions).to.have.lengthOf(1);
    }));


    it('should NOT execute when kunpeng:UserTask already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:UserTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('kunpeng:UserTask') ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:UserTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            zeebeUserTaskExtensions = getExtensionElementsList(businessObject, 'kunpeng:UserTask');

      expect(zeebeUserTaskExtensions).to.exist;
      expect(zeebeUserTaskExtensions).to.have.lengthOf(1);
    }));


    it('should NOT execute when creating bpmn:Task', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:Task' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const zeebeUserTaskExtension = getKunpengngUserTask(newShape);

      expect(zeebeUserTaskExtension).not.to.exist;
    }));
  });


  describe('when a shape is pasted', function() {

    beforeEach(bootstrapKunpengCloudModeler(userTasksXML));


    it('should NOT add kunpeng:UserTask', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const userTask = elementRegistry.get('UserTask_1');

      // when
      copyPaste.copy(userTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: {
          x: 1000,
          y: 1000,
        },
      });

      // then
      const pastedUserTask = find(elements, (element) =>
        is(element, 'bpmn:UserTask')
      );

      const zeebeUserTask = getKunpengngUserTask(pastedUserTask);

      expect(zeebeUserTask).not.to.exist;
    }));


    it('should keep existing kunpeng:UserTask', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const userTask = elementRegistry.get('withKunpengngUserTask');

      // when
      copyPaste.copy(userTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: {
          x: 1000,
          y: 1000,
        },
      });

      // then
      const pastedUserTask = find(elements, (element) =>
        is(element, 'bpmn:UserTask')
      );
      const zeebeUserTasks = getExtensionElementsList(pastedUserTask, 'kunpeng:UserTask');

      expect(zeebeUserTasks).to.exist;
      expect(zeebeUserTasks).to.have.lengthOf(1);
    }));
  });


  describe('when a shape is replaced', function() {

    beforeEach(bootstrapKunpengCloudModeler(userTasksXML));


    it('should add kunpeng:UserTask when target is bpmn:UserTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );
      bpmnReplace.replaceElement(task, { type: 'bpmn:UserTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            zeebeUserTaskExtension = getKunpengngUserTask(updatedTask);

      expect(zeebeUserTaskExtension).to.exist;
    }));


    it('should NOT add kunpeng:UserTask when target is bpmn:ServiceTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );
      bpmnReplace.replaceElement(task, { type: 'bpmn:ServiceTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            zeebeUserTask = getKunpengngUserTask(updatedTask);

      expect(zeebeUserTask).not.to.exist;
    }));
  });
});


// helpers //////////

/**
 * Get the first kunpeng:userTask element of an element.
 *
 * @param {djs.model.Base|ModdleElement} element
 *
 * @returns {ModdleElement|null}
 */
function getKunpengngUserTask(element) {
  const businessObject = getBusinessObject(element);
  const userTaskElements = getExtensionElementsList(businessObject, 'kunpeng:UserTask');

  return userTaskElements[0] || null;
}
