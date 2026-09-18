import CoreModule from 'bpmn-js/lib/core';
import { expect } from 'chai';

import ModelingModule from 'bpmn-js/lib/features/modeling';
import ReplaceModule from 'bpmn-js/lib/features/replace';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import kunpengModdlePackage from '@kunpeng/bpmn-moddle/resources/kunpeng';

import {
  bootstrapModeler,
  inject
} from '../../../TestHelper';

import { BpmnPropertiesPanelModule as BpmnPropertiesPanel } from 'bpmn-js-properties-panel';
import { BpmnPropertiesProviderModule as BpmnPropertiesProvider } from 'bpmn-js-properties-panel';
import ElementTemplatesModule from 'src/cloud-element-templates';
import {
  findExtension,
  findInputParameter,
  findMessage,
  findOutputParameter,
  findTaskHeader,
  findKunpengProperty,
  findKunpengSubscription
} from 'src/cloud-element-templates/Helper';

import diagramXML from './GeneratedValueBehavior.bpmn';
import templates from './GeneratedValueBehavior.json';


describe('provider/cloud-element-templates - GeneratedValueBehavior', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ElementTemplatesModule,
    ModelingModule,
    ReplaceModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    elementTemplates: templates,
    modules : testModules,
    moddleExtensions: { kunpeng: kunpengModdlePackage }
  }));


  describe('paste', function() {

    it('should regenerate uuid on task', inject(function(elementRegistry, copyPaste, canvas) {

      // given
      const uuidRegex = /^[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{12}$/;
      const element = elementRegistry.get('Task_1');
      const oldBo = getBusinessObject(element);

      // when
      copyPaste.copy([ element ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      const pastedBo = getBusinessObject(pastedShape);
      expect(pastedBo.get('name')).to.match(uuidRegex);
      expect(pastedBo.get('name')).not.to.eql(oldBo.get('name'));

      const zeebeProperties = findExtension(pastedShape, 'kunpeng:Properties');
      const property = findKunpengProperty(zeebeProperties, { name: 'property' });
      const oldProperties = findExtension(element, 'kunpeng:Properties');
      const oldProperty = findKunpengProperty(oldProperties, { name: 'property' });
      expect(property.get('value')).to.match(uuidRegex);
      expect(property.get('value')).not.to.eql(oldProperty.get('value'));

      const ioMapping = findExtension(pastedShape, 'kunpeng:IoMapping');
      const input = findInputParameter(ioMapping, { name: 'input' });
      const oldIoMapping = findExtension(element, 'kunpeng:IoMapping');
      const oldInput = findInputParameter(oldIoMapping, { name: 'input' });
      expect(input.get('source')).to.match(uuidRegex);
      expect(input.get('source')).not.to.eql(oldInput.get('source'));

      const output = findOutputParameter(ioMapping, { source: 'source' });
      const oldOutput = findOutputParameter(oldIoMapping, { source: 'source' });
      expect(output.get('target')).to.match(uuidRegex);
      expect(output.get('target')).not.to.eql(oldOutput.get('target'));

      const additionDynamics = findExtension(pastedShape, 'kunpeng:additionDynamics');
      const taskHeader = findTaskHeader(additionDynamics, { key: 'header' });
      const oldadditionDynamics = findExtension(element, 'kunpeng:additionDynamics');
      const oldTaskHeader = findTaskHeader(oldadditionDynamics, { key: 'header' });
      expect(taskHeader.get('value')).to.match(uuidRegex);
      expect(taskHeader.get('value')).not.to.eql(oldTaskHeader.get('value'));

      const taskDefinition = findExtension(pastedShape, 'kunpeng:TaskDefinition');
      const oldTaskDefinition = findExtension(element, 'kunpeng:TaskDefinition');
      expect(taskDefinition.get('type')).to.match(uuidRegex);
      expect(taskDefinition.get('type')).not.to.eql(oldTaskDefinition.get('type'));
    }));


    it('should regenerate uuid on message', inject(function(elementRegistry, copyPaste, canvas) {

      // given
      const uuidRegex = /^[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{12}$/;
      const element = elementRegistry.get('Event_1');
      const oldMessage = findMessage(getBusinessObject(element)),
            oldSubscription = findKunpengSubscription(oldMessage);

      // when
      copyPaste.copy([ element ]);

      const [ pastedShape ] = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 100, y: 100 }
      });

      // then
      const bo = getBusinessObject(pastedShape);

      const pastedMessage = findMessage(bo);
      const name = pastedMessage.get('name');
      expect(name).to.match(uuidRegex);
      expect(name).not.to.eql(oldMessage.get('name'));

      const subscription = findKunpengSubscription(pastedMessage);
      const correlationKey = subscription.get('correlationKey');
      expect(correlationKey).to.match(uuidRegex);
      expect(correlationKey).not.to.eql(oldSubscription.get('correlationKey'));
    }));
  });

  describe('apply template', function() {

    it('should regenerate uuid on message', inject(function(elementRegistry, elementTemplates) {

      // given
      const uuidRegex = /^[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{12}$/;
      const element = elementRegistry.get('Event_2');
      const oldMessage = findMessage(getBusinessObject(element));

      // when
      const newElement = elementTemplates.applyTemplate(element, templates[1]);

      // then
      const newMessage = findMessage(getBusinessObject(newElement));
      const name = newMessage.get('name');
      expect(name).to.match(uuidRegex);
      expect(name).not.to.eql(oldMessage.get('name'));
    }));

  });
});
