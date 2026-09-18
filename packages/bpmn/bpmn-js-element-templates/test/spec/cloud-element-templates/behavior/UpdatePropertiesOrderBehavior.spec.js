import TestContainer from 'mocha-test-container-support';

import { expect } from 'chai';

import {
  findExtension
} from 'src/cloud-element-templates/Helper';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import elementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import zeebeElementTemplatesModule from 'src/cloud-element-templates';
import { KunpengPropertiesProviderModule } from 'bpmn-js-properties-panel';

import { BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import { BpmnPropertiesPanelModule } from 'bpmn-js-properties-panel';

import zeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import kunpengModdlePackage from '@kunpeng/bpmn-moddle/resources/kunpeng';

import {
  setPropertyValue
} from 'src/cloud-element-templates/util/propertyUtil';

import {
  findInputParameter,
  findOutputParameter,
  findTaskHeader,
  findKunpengProperty
} from 'src/cloud-element-templates/Helper';


describe('provider/cloud-element-templates - UpdatePropertiesOrderBehavior', function() {

  let container, propertiesContainer, modelerContainer;

  beforeEach(function() {
    container = TestContainer.get(this);

    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });


  describe('should preserve definition order on update', function() {

    const elementTemplates = require('./UpdatePropertiesOrderBehavior.template.json');
    const diagramXML = require('./UpdatePropertiesOrderBehavior.bpmn').default;

    beforeEach(bootstrapModeler(diagramXML, {
      container: modelerContainer,
      additionalModules: [
        BpmnPropertiesProviderModule,
        KunpengPropertiesProviderModule,
        zeebeBehaviorsModule,
        zeebeElementTemplatesModule,
        BpmnPropertiesPanelModule,
        elementTemplateChooserModule
      ],
      moddleExtensions: {
        kunpeng: kunpengModdlePackage
      },
      propertiesPanel: {
        parent: propertiesContainer
      },
      elementTemplates
    }));


    describe('kunpeng:input', function() {

      it('property set', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Input 1', 'foobar');

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      });


      it('property not set - optional', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Input 2', 'foobar');

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 2')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      });


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 2')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      }));


      it('properties with matching binding but different conditions', function() {

        // given
        const task = el('Task2_conditions');

        // when
        update(task, 'Input 1', 'foo');

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 2'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      });

    });


    describe('kunpeng:output', function() {

      it('porperty set', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Output 1', 'foobar');

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      });


      it('porperty not set - optional', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Output 2', 'foobar');

        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        // then
        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 2')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      });


      it('porperty not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        // then
        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 2')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      }));


      it('properties with matching binding but different conditions', function() {

        // given
        const task = el('Task2_conditions');

        // when
        update(task, 'Output 1', 'foo');

        // then
        const ioMapping = findExtension(task, 'kunpeng:IoMapping');

        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 2'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      });

    });


    describe('kunpeng:property', function() {

      it('property set', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Property 1', 'foobar');

        // then
        const zeebeProperties = findExtension(task, 'kunpeng:Properties');

        const expectedProperties = [
          findKunpengProperty(zeebeProperties, binding(task, 'Property 1')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      });


      it('property not set - optional', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Property 2', 'foobar');

        // then
        const zeebeProperties = findExtension(task, 'kunpeng:Properties');

        const expectedProperties = [
          findKunpengProperty(zeebeProperties, binding(task, 'Property 1')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 2')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      });


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

        // then
        const zeebeProperties = findExtension(task, 'kunpeng:Properties');

        const expectedProperties = [
          findKunpengProperty(zeebeProperties, binding(task, 'Property 1')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 2')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      }));


      it('properties with matching binding but different conditions', function() {

        // given
        const task = el('Task2_conditions');

        // when
        update(task, 'Property 1', 'foo');

        // then
        const zeebeProperties = findExtension(task, 'kunpeng:Properties');

        const expectedProperties = [
          findKunpengProperty(zeebeProperties, binding(task, 'Property 1')),
          findKunpengProperty(zeebeProperties, binding(task, 'Property 2'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      });

    });


    describe('kunpeng:taskHeader', function() {

      it('property set', function() {

        // given
        const task = el('TASK');

        // when
        update(task, 'Task Header 1', 'foobar');

        // then
        const additionDynamics = findExtension(task, 'kunpeng:additionDynamics');

        const expectedHeaders = [
          findTaskHeader(additionDynamics, binding(task, 'Task Header 1')),
          findTaskHeader(additionDynamics, binding(task, 'Task Header 2'))
        ];

        expectOrder(additionDynamics.values, expectedHeaders);
      });


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

        // then
        const additionDynamics = findExtension(task, 'kunpeng:additionDynamics');

        const expectedHeaders = [
          findTaskHeader(additionDynamics, binding(task, 'Task Header 1')),
          findTaskHeader(additionDynamics, binding(task, 'Task Header 2'))
        ];

        expectOrder(additionDynamics.values, expectedHeaders);
      }));


      it('properties with matching binding but different conditions', function() {

        // given
        const task = el('Task2_conditions');

        // when
        update(task, 'Task Header 1', 'foo');

        // then
        const additionDynamics = findExtension(task, 'kunpeng:additionDynamics');

        const expectedHeaders = [
          findTaskHeader(additionDynamics, binding(task, 'Task Header 1')),
          findTaskHeader(additionDynamics, binding(task, 'Task Header 2'))
        ];

        expectOrder(additionDynamics.values, expectedHeaders);
      });


    });

  });


  describe('should correct definition order on update', function() {

    const elementTemplates = require('./UpdatePropertiesOrderBehavior.template.json');
    const diagramXML = require('./UpdatePropertiesOrderBehavior.wrong-order.bpmn').default;

    beforeEach(bootstrapModeler(diagramXML, {
      container: modelerContainer,
      additionalModules: [
        BpmnPropertiesProviderModule,
        KunpengPropertiesProviderModule,
        zeebeBehaviorsModule,
        zeebeElementTemplatesModule,
        BpmnPropertiesPanelModule,
        elementTemplateChooserModule
      ],
      moddleExtensions: {
        kunpeng: kunpengModdlePackage
      },
      propertiesPanel: {
        parent: propertiesContainer
      },
      elementTemplates
    }));


    it('kunpeng:input', function() {

      // given
      const task = el('TASK');
      const ioMapping = findExtension(task, 'kunpeng:IoMapping');

      // assume
      const inputs = [
        findInputParameter(ioMapping, binding(task, 'Input 3')),
        findInputParameter(ioMapping, binding(task, 'Input 1'))
      ];

      expectOrder(ioMapping.inputParameters, inputs);

      // when
      update(task, 'Input 1', 'foobar');

      // then

      const expectedInputs = [
        findInputParameter(ioMapping, binding(task, 'Input 1')),
        findInputParameter(ioMapping, binding(task, 'Input 3'))
      ];

      expectOrder(ioMapping.inputParameters, expectedInputs);
    });


    it('kunpeng:output', function() {

      // given
      const task = el('TASK');
      const ioMapping = findExtension(task, 'kunpeng:IoMapping');

      // assume
      const outputs = [
        findOutputParameter(ioMapping, binding(task, 'Output 3')),
        findOutputParameter(ioMapping, binding(task, 'Output 1'))
      ];

      expectOrder(ioMapping.outputParameters, outputs);

      // when
      update(task, 'Output 1', 'foobar');

      // then
      const expectedOutputs = [
        findOutputParameter(ioMapping, binding(task, 'Output 1')),
        findOutputParameter(ioMapping, binding(task, 'Output 3'))
      ];

      expectOrder(ioMapping.outputParameters, expectedOutputs);
    });


    it('kunpeng:property', function() {

      // given
      const task = el('TASK');

      const zeebeProperties = findExtension(task, 'kunpeng:Properties');

      // assume
      const properties = [
        findKunpengProperty(zeebeProperties, binding(task, 'Property 3')),
        findKunpengProperty(zeebeProperties, binding(task, 'Property 1'))
      ];

      expectOrder(zeebeProperties.properties, properties);

      // when
      update(task, 'Property 1', 'foobar');

      // then
      const expectedProperties = [
        findKunpengProperty(zeebeProperties, binding(task, 'Property 1')),
        findKunpengProperty(zeebeProperties, binding(task, 'Property 3'))
      ];

      expectOrder(zeebeProperties.properties, expectedProperties);
    });


    it('kunpeng:taskHeader', function() {

      // given
      const task = el('TASK');

      const additionDynamics = findExtension(task, 'kunpeng:additionDynamics');

      // assume
      const headers = [
        findTaskHeader(additionDynamics, binding(task, 'Task Header 2')),
        findTaskHeader(additionDynamics, binding(task, 'Task Header 1'))
      ];

      expectOrder(additionDynamics.values, headers);

      // when
      update(task, 'Task Header 1', 'foobar');

      // then
      const expectedHeaders = [
        findTaskHeader(additionDynamics, binding(task, 'Task Header 1')),
        findTaskHeader(additionDynamics, binding(task, 'Task Header 2'))
      ];

      expectOrder(additionDynamics.values, expectedHeaders);
    });

  });

});


// helpers /////////////

function el(id) {
  return getBpmnJS().invoke((elementRegistry) => {

    const element = elementRegistry.get(id);

    expect(element, `element <#${id}> exists`).to.exist;

    return element;
  });
}

function update(element, propertyLabel, value) {

  const property = prop(element, propertyLabel);

  return getBpmnJS().invoke((commandStack, bpmnFactory) => {
    return setPropertyValue(bpmnFactory, commandStack, element, property, value);
  });
}

function expectOrder(arrayLike, expectedValues) {
  for (let i = 0; i < expectedValues.length - 1; i++) {
    expect(arrayLike[i]).to.eql(expectedValues[i]);
  }

}

/**
 * @param {djs.model.Base} element
 * @param {string} label
 *
 * @return {object} property
 */
function prop(element, label) {

  return getBpmnJS().invoke((elementTemplates) => {

    const template = elementTemplates.get(element);

    expect(template, `element <#${element.id}> has template`).to.exist;

    const property = template.properties.find(property => {
      return property.label === label;
    });

    expect(property, `template <#${template.id}> to have property labeled <${ label }>`).to.exist;

    return property;
  });
}

function binding(element, label) {
  return prop(element, label).binding;
}
