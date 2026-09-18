import TestContainer from 'mocha-test-container-support';

import {
  bootstrapBpmnJS,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import Modeler from 'bpmn-js/lib/Modeler';

import testCss from './test.css?raw';

let PROPERTIES_PANEL_CONTAINER;

export * from 'bpmn-js/test/helper';

export {
  createCanvasEvent,
  createEvent
} from 'bpmn-js/test/util/MockEvents';

export function bootstrapPropertiesPanel(diagram, options, locals) {
  return async function() {
    const container = TestContainer.get(this);

    // (1) create modeler + import diagram
    await bootstrapBpmnJS(Modeler, diagram, options, locals);

    // (2) clean-up properties panel
    clearPropertiesPanelContainer();

    // (3) attach properties panel
    const attachPropertiesPanel = inject(function(propertiesPanel) {
      PROPERTIES_PANEL_CONTAINER = document.createElement('div');
      PROPERTIES_PANEL_CONTAINER.classList.add('properties-container');

      container.appendChild(PROPERTIES_PANEL_CONTAINER);

      propertiesPanel.attachTo(PROPERTIES_PANEL_CONTAINER);
    });
    await attachPropertiesPanel();
  };
}

export function clearPropertiesPanelContainer() {
  if (PROPERTIES_PANEL_CONTAINER) {
    PROPERTIES_PANEL_CONTAINER.remove();
  }
}

// Styles are purely cosmetic under happy-dom; only the local test.css is
// injected (it resolves without package-exports issues). External CSS from
// workspace packages is gated behind restrictive exports maps and omitted.
export function insertCoreStyles() {
  insertCSS('test.css', testCss);
}

export function bootstrapModeler(diagram, options, locals) {
  return bootstrapBpmnJS(Modeler, diagram, options, locals);
}
