import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from '@kunpeng/bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule
} from '@kunpeng/bpmn-js-element-templates';

import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';

import connectorTemplates from 'test/fixtures/zeebe/connectors.json';

import ZeebeBehaviorsModule from '@kunpeng/bpmn-js-behaviors';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import { KunpengVariableResolverModule } from 'lib/';
import VariableProvider from 'lib/VariableProvider';

import Modeler from 'bpmn-js/lib/Modeler';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import simpleXML from '../fixtures/zeebe/simple.bpmn';
import { setBpmnJS, clearBpmnJS, insertCoreStyles } from '../TestHelper';

const singleStart = window.__env__ && window.__env__.SINGLE_START;


insertCoreStyles();

describe('Example', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  let modelerContainer, propertiesContainer;

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
    const {
      shouldImport = true,
      additionalModules = [
        ZeebeBehaviorsModule,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      description = {},
      layout = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description,
        layout
      },
      ...options
    });

    setBpmnJS(modeler);

    if (!shouldImport) {
      return { modeler };
    }

    try {
      const result = await modeler.importXML(xml);

      return { error: null, warnings: result.warnings, modeler: modeler };
    } catch (err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    }
  }

  (singleStart ? it.only : it)('example', async function() {
    const result = await createModeler(simpleXML,
      {
        additionalModules: [
          ZeebeBehaviorsModule,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ZeebePropertiesProviderModule,
          KunpengVariableResolverModule,
          CloudElementTemplatesPropertiesProviderModule,
          ElementTemplateChooserModule,
          AdditionalVariableModule
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
        elementTemplates: connectorTemplates
      });

    expect(result.error).to.not.exist;
  });

});


// helpers //////////////////////

class AdditionalVariableProvider extends VariableProvider {

  getVariables(element) {
    if (!is(element, 'bpmn:Process')) {
      return;
    }

    return [
      {
        name: 'globalVariable',
        type: 'Context',
        info: 'Example Process Start Data',
        entries: [
          {
            name: 'id',
            type: 'Number',
            info: 'The customer ID'
          },
          {
            name: 'name',
            type: 'String',
            info: '"Jon Doe"'
          },
          {
            name: 'dob',
            type: 'String',
            info: 'Date of Birth'
          },
          {
            name: 'contact',
            type: 'Context',
            info: 'Contact information',
            entries: [
              {
                name: 'email',
                type: 'String',
                info: 'john.doe@company.tld'
              },
              {
                name: 'Phone',
                type: 'String',
                info: '+1 555 123 4567'
              },
              {
                name: 'Address',
                type: 'String',
                info: '123 Main Street, Anytown, USA'
              }
            ]
          }
        ]
      }
    ];

  }
}

const AdditionalVariableModule = {
  __init__: [
    'additionalVariableProvider',
  ],
  additionalVariableProvider: [ 'type', AdditionalVariableProvider ],
};
