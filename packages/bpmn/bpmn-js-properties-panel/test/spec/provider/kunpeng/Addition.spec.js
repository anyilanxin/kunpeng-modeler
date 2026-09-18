import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import KunpengPropertiesProvider from 'src/provider/kunpeng';

import kunpengModdleExtensions from '@kunpeng/bpmn-moddle/resources/kunpeng';

import {
  getAdditions
} from 'src/provider/kunpeng/utils/AdditionsUtil';

import diagramXML from './Addition.bpmn';


describe('provider/kunpeng - Addition', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    KunpengPropertiesProvider
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


  describe('bpmn:ServiceTask#addition.key', function() {

    it('should NOT display for empty dynamicAdditions',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const additionGroup = getGroup(container, 'additions');
        const keyInput = domQuery('input[name=ServiceTask_empty-addition-0-key]', additionGroup);

        // then
        expect(keyInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const additionGroup = getGroup(container, 'addition');
      const keyInput = domQuery('input[name=ServiceTask_1-addition-0-key]', additionGroup);

      // then
      expect(keyInput.value).to.eql(getAddition(serviceTask)[0].get('key'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const additionGroup = getGroup(container, 'additions');
      const keyInput = domQuery('input[name=ServiceTask_1-addition-0-key]', additionGroup);
      changeInput(keyInput, 'newValue');

      // then
      expect(getAddition(serviceTask)[0].get('key')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getAddition(serviceTask)[0].get('key');

        await act(() => {
          selection.select(serviceTask);
        });
        const additionGroup = getGroup(container, 'additions');
        const keyInput = domQuery('input[name=ServiceTask_1-addition-0-key]', additionGroup);
        changeInput(keyInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(keyInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#addition.value', function() {

    it('should NOT display for empty dynamicAdditions',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const additionGroup = getGroup(container, 'additions');
        const valueInput = domQuery('textarea[name=ServiceTask_empty-addition-0-value]', additionGroup);

        // then
        expect(valueInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const additionGroup = getGroup(container, 'additions');
      const valueInput = domQuery('textarea[name=ServiceTask_1-addition-0-value]', additionGroup);

      // then
      expect(valueInput.value).to.eql(getAddition(serviceTask)[0].get('value'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const additionGroup = getGroup(container, 'additions');
      const valueInput = domQuery('textarea[name=ServiceTask_1-addition-0-value]', additionGroup);
      changeInput(valueInput, 'newValue');

      // then
      expect(getAddition(serviceTask)[0].get('value')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getAddition(serviceTask)[0].get('value');

        await act(() => {
          selection.select(serviceTask);
        });
        const additionGroup = getGroup(container, 'additions');
        const valueInput = domQuery('textarea[name=ServiceTask_1-addition-0-value]', additionGroup);
        changeInput(valueInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(valueInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getAddition(element, idx) {
  return (getAdditions(element) || [])[idx];
}

