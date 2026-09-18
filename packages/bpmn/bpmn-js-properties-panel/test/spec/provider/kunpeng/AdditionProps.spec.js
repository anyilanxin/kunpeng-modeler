import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/kunpeng';

import kunpengModdleExtensions from '@kunpeng/bpmn-moddle/resources/kunpeng';

import {
  getAdditions,
  getDynamicAdditions
} from 'src/provider/kunpeng/utils/AdditionsUtil';

import diagramXML from './AdditionProps.bpmn';


describe('provider/kunpeng - AdditionProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    kunpeng: kunpengModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('bpmn:ServiceTask#DynamicAdditions', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const additionGroup = getGroup(container, 'additions');

      // then
      expect(additionGroup).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const additionGroup = getGroup(container, 'additions');
      const additionListItems = getAdditionListItems(additionGroup);

      // then
      expect(additionGroup).to.exist;
      expect(additionListItems.length).to.equal(getAdditions(serviceTask).length);
    }));


    it('should add new addition', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const additionGroup = getGroup(container, 'additions');
      const addEntry = domQuery('.bio-properties-panel-add-entry', additionGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getAdditions(serviceTask)).to.have.length(5);
    }));


    it('should add new addition to bottom', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const additionGroup = getGroup(container, 'additions');
      const addEntry = domQuery('.bio-properties-panel-add-entry', additionGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      const additionLabel = getAdditionLabel(container, 0);

      expect(additionLabel.innerHTML).to.equal('additionKey_1');
    }));


    it('should sort input items according to XML', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const additions = getAdditions(serviceTask);

      for (let idx = 0; idx < additions.length; idx++) {
        const additionLabel = getAdditionLabel(container, idx).innerHTML;

        expect(additions[idx].key).to.equal(additionLabel);
      }
    }));


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).not.to.exist;

        const additionGroup = getGroup(container, 'additions');
        const addEntry = domQuery('.bio-properties-panel-add-entry', additionGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing additionDynamics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noadditionDynamics');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getDynamicAdditions(serviceTask)).not.to.exist;

        const additionGroup = getGroup(container, 'additions');
        const addEntry = domQuery('.bio-properties-panel-add-entry', additionGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getDynamicAdditions(serviceTask)).to.exist;
      })
    );


    it('should delete addition', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const additionListItems = getAdditionListItems(getGroup(container, 'additions'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', additionListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getAdditions(serviceTask)).to.have.length(3);
    }));


    it('should remove dynamicAdditions on last delete', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getDynamicAdditions(serviceTask)).to.exist;

      const additionListItems = getAdditionListItems(getGroup(container, 'additions'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', additionListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getDynamicAdditions(serviceTask)).not.to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalAdditions = getAdditions(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addEntry = domQuery('.bio-properties-panel-add-entry', container);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const additionListItems = getAdditionListItems(getGroup(container, 'additions'));

        // then
        expect(additionListItems.length).to.eql(originalAdditions.length);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getAdditionListItems(container) {
  return getListItems(container, 'addition');
}

function getAdditionLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}
