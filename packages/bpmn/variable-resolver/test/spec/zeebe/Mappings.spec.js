import { expect } from 'chai';
import sinon from 'sinon';

import TestContainer from 'mocha-test-container-support';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getInputOutput } from '../../../lib/base/util/ExtensionElementsUtil';

import { bootstrapModeler, inject } from 'test/TestHelper';

import { KunpengVariableResolverModule } from 'lib/';

import chainedMappingsXML from 'test/fixtures/zeebe/mappings/chained-mappings.bpmn';
import chainedMappingsAnyXML from 'test/fixtures/zeebe/mappings/chained-mappings.any.bpmn';
import consumedVariablesXML from 'test/fixtures/zeebe/mappings/input-requirements.bpmn';
import primitivesXML from 'test/fixtures/zeebe/mappings/primitives.bpmn';
import mergingXML from 'test/fixtures/zeebe/mappings/merging.bpmn';
import mergingChildrenXML from 'test/fixtures/zeebe/mappings/merging.children.bpmn';
import mergingNullXML from 'test/fixtures/zeebe/mappings/merging.null.bpmn';
import mergingAnyXML from 'test/fixtures/zeebe/mappings/merging.any.bpmn';
import mergingAnyExpressionsXML from 'test/fixtures/zeebe/mappings/merging.any-expression.bpmn';
import scopeXML from 'test/fixtures/zeebe/mappings/scope.bpmn';
import propagationXML from 'test/fixtures/zeebe/mappings/propagation.bpmn';
import scriptTaskXML from 'test/fixtures/zeebe/mappings/script-task.bpmn';
import scriptTaskEmptyExpressionXML from 'test/fixtures/zeebe/mappings/script-task-empty-expression.bpmn';
import scriptTaskOutputNoNameXML from 'test/fixtures/zeebe/mappings/script-task-output-no-name.bpmn';
import unresolvablePathExpressionXML from 'test/fixtures/zeebe/mappings/unresolvable-path-expression.bpmn';
import scriptTaskInputsXML from 'test/fixtures/zeebe/mappings/script-task-inputs.bpmn';
import scriptTaskWithInputMappingsXML from 'test/fixtures/zeebe/mappings/script-task-with-input-mappings.bpmn';
import inputOutputConflictXML from 'test/fixtures/zeebe/mappings/input-output-conflict.bpmn';
import emptyXML from 'test/fixtures/zeebe/empty.bpmn';

import VariableProvider from 'lib/VariableProvider';


describe('ZeebeVariableResolver - Variable Mappings', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  const bootstrap = (xml) => {
    return bootstrapModeler(xml, {
      container,
      additionalModules: [
        KunpengVariableResolverModule
      ],
      moddleExtensions: {
        zeebe: ZeebeModdle
      }
    });
  };

  describe('Mappings', function() {

    beforeEach(bootstrap(chainedMappingsXML));

    it('should keep schema through multiple mappings', inject(async function(variableResolver, elementRegistry) {

      // given
      createProvider({
        variables: toVariableFormat({ globalVariable: { foo: { bar: { baz: {} } } } }),
        variableResolver
      });

      const root = elementRegistry.get('Process_1');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject);

      // then
      expect(variables).to.variableEqual([
        ...toVariableFormat({ globalVariable: { foo: { bar: { baz: {} } } } }),
        { name: 'variable1', type: 'fooType', info: 'fooInfo', entries: toVariableFormat({ bar: { baz: {} } }) },
        { name: 'variable2', type: 'barType', info: 'barInfo', entries: toVariableFormat({ baz: {} }) },
        { name: 'variable3', type: 'bazType', info: 'bazInfo', entries: [] },
        { name: 'variable4', type: 'bazType', info: 'bazInfo', entries: [] }
      ]);
    }));

  });


  describe('Mappings - any', function() {

    beforeEach(bootstrap(chainedMappingsAnyXML));


    it('should map <Any>', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_3');
      const task = elementRegistry.get('Task_9');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExisting_fromProcess',
          type: 'Any',
          scope: 'SubProcess_3'
        },
        {
          name: 'result_fromSubProcess',
          type: 'Any',
          scope: 'Process_6'
        },
        {
          name: 'result_fromProcess',
          type: 'Any',
          scope: 'Process_6'
        }
      ]);

      // when
      const taskVariables = await variableResolver.getVariablesForElement(task);

      // then
      expect(taskVariables).to.variableEqual([
        {
          name: 'nonExisting_fromProcess',
          type: 'Any',
          scope: 'SubProcess_3'
        },
        {
          name: 'result_fromSubProcess',
          type: 'Any',
          scope: 'Process_6'
        },
        {
          name: 'result_fromProcess',
          type: 'Any',
          scope: 'Process_6'
        },
        { name: 'taskVariable_fromSubProcess', scope: 'Task_9', type: 'Any' },
        { name: 'taskVariable_fromProcess', scope: 'Task_9', type: 'Any' }
      ]);
    }));

  });


  describe('Primitives', function() {

    beforeEach(bootstrap(primitivesXML));


    it('should add type description for primitive data types', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Process_1');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'genericTypes',
          type: 'Context',
          info: '',
          entries: [
            { name: 'string', type: 'String', info: '"foo"', entries: [] },
            { name: 'number', type: 'Number', info: '1', entries: [] },
            { name: 'booleanTrue', type: 'Boolean', info: 'true', entries: [] },
            { name: 'booleanFalse', type: 'Boolean', info: 'false', entries: [] },
            { name: 'null', type: 'Null', entries: [] },
          ]
        }
      ]);
    }));


    it('should map to editor format (detail, info, entries)', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Process_1');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'genericTypes',
          detail: 'Context',
          info: '',
          entries: [
            { name: 'string', detail: 'String', info: '"foo"', entries: [] },
            { name: 'number', detail: 'Number', info: '1', entries: [] },
            { name: 'booleanTrue', detail: 'Boolean', info: 'true', entries: [] },
            { name: 'booleanFalse', detail: 'Boolean', info: 'false', entries: [] },
            { name: 'null', detail: 'Null', entries: [] },
          ]
        }
      ]);
    }));

  });


  describe('Merging', function() {

    beforeEach(bootstrap(mergingXML));


    it('should merge multiple variables (if-else)', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_1');

      const initialVariables = [ {
        name: 'globalVariable',
        type: 'TestVariable',
        info: 'TestInfo',
        entries: [
          { name: 'foo' },
        ]
      } ];

      createProvider({
        variables: initialVariables,
        variableResolver
      });

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        ...initialVariables,
        {
          name: 'mergedContext',
          type: 'Context',
          entries: [
            { name: 'a', type: 'TestVariable', info: 'TestInfo', entries: [ { name: 'foo' } ] },
            { name: 'b', type: 'TestVariable', info: 'TestInfo', entries: [ { name: 'foo' } ] }
          ]
        }
      ]);
    }));


    it('should merge variables with global context', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_1');

      const initialVariables = [
        {
          name: 'globalVariable',
          type: 'TestVariable',
          info: 'TestInfo',
          entries: [
            { name: 'foo' },
          ]
        },
        {
          name: 'mergedContext',
          type: 'globalType',
          info: 'globalInfo',
          entries: [
            { name: 'bar' },
          ]
        }
      ];

      createProvider({
        variables: initialVariables,
        variableResolver
      });

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'globalVariable',
          type: 'TestVariable',
          info: 'TestInfo',
          entries: [
            { name: 'foo' },
          ]
        },
        {
          name: 'mergedContext',
          type: 'Context|globalType',
          entries: [
            { name: 'a', type: 'TestVariable', info: 'TestInfo', entries: [ { name: 'foo' } ] },
            { name: 'b', type: 'TestVariable', info: 'TestInfo', entries: [ { name: 'foo' } ] },
            { name: 'bar' }
          ]
        }
      ]);
    }));


    it('should merge multiple variables', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_2');

      createProvider({
        variables: [],
        variableResolver
      });

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'multipleSources',
          type: 'Context|String',
          entries: [
            { name: 'a' },
            { name: 'b' },
          ]
        }
      ]);
    }));


    it('should handle many merge operations', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_3');

      createProvider({
        variables: [],
        variableResolver
      });

      // when
      // this failed previously in an infinite loop, cf. https://github.com/camunda/camunda-modeler/issues/4139
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo'
        }
      ]);
    }));

  });


  describe('Merging - null', function() {

    beforeEach(bootstrap(mergingNullXML));


    it('should combine local <null> and child output', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'processVariable',
          type: 'Null|Number',
          scope: 'Process_4',
          origin: [ 'SubProcess_1' ]
        },
        {
          name: 'localVariable',
          type: 'Null|Number',
          scope: 'SubProcess_1',
          origin: [ 'SubProcess_1', 'Task_6' ]
        }
      ]);
    }));

  });


  describe('Merging - children types', function() {

    beforeEach(bootstrap(mergingChildrenXML));


    it('should combine and child productions output', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_2');

      createProvider({
        variables: [],
        variableResolver
      });

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'processVariable',
          type: 'Boolean|Number|String',
          scope: 'Process_5'
        },
        {
          name: 'variable',
          type: 'Boolean|Number|String',
          scope: 'SubProcess_2'
        }
      ]);
    }));

  });


  describe('Merging - any', function() {

    beforeEach(bootstrap(mergingAnyXML));


    it('should combine local <Any> and child output', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_4');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'processVariable',
          type: 'Any|Number',
          scope: 'Process_7'
        },
        {
          name: 'localVariable',
          type: 'Any|Number',
          scope: 'SubProcess_4'
        }
      ]);
    }));

  });


  describe('Merging - any expressions', function() {

    beforeEach(bootstrap(mergingAnyExpressionsXML));


    it('should combine source expressions', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('Process_1');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'variable',
          type: 'Any',
          info: '=unknown\n=alsoUnknown'
        }
      ]);
    }));

  });


  describe('Unresolvable path expression', function() {

    beforeEach(bootstrap(unresolvablePathExpressionXML));


    it('should resolve unresolvable path expression as <Any>', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      // cf. https://github.com/bpmn-io/variable-resolver/issues/87
      expect(variables).to.variableEqual([
        {
          name: 'agentContext',
          type: 'Any',
          info: '=agent.context'
        },
        {
          name: 'agent',
          type: 'Any',
          info: '=agent'
        }
      ]);
    }));

  });


  describe('Scope', function() {

    beforeEach(bootstrap(scopeXML));


    it('should only resolve variables in scope', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_1');

      const initialVariables = [ {
        name: 'globalVariable',
        type: 'String',
        info: '1',
        entries: [ ]
      } ];

      createProvider({
        variables: initialVariables,
        variableResolver
      });

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        ...initialVariables,
        {
          name: 'fooOutputVariable',
          type: 'String',
          info: '1'
        },
        {
          name: 'barOutputVariable',
          type: 'Any',
          info: '=fooInputVariable'
        }
      ]);
    }));


    it('should resolve result variable if no outputs exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_4');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'resultVariable',
          type: 'String',
          info: '"1"'
        }
      ]);
    }));


    it('should resolve output instead of result variable if outputs exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_3');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'output',
          type: 'String',
          info: '"2"'
        }
      ]);
    }));


    it('should only resolve result variable if input and result variable with same name exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('ScriptTask_1');
      const bo = root.businessObject;
      const output = getInputOutput(bo).outputParameters[0];

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject, output);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo',
          type: 'String',
          info: '"1"'
        }
      ]);
    }));


    it('should only resolve the output variable if result variable and output with same name exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('ScriptTask_4');
      const bo = root.businessObject;
      const output = getInputOutput(bo).outputParameters[1];

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject, output);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo',
          type: 'String',
          info: '"2"'
        }
      ]);
    }));


    it('should only resolve the output variable if input and output with same name exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('ServiceTask_3');
      const bo = root.businessObject;
      const output = getInputOutput(bo).outputParameters[1];

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject, output);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo',
          type: 'String',
          info: '"2"'
        }
      ]);
    }));


    it('should only resolve the latest variable if inputs with same name exist', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('ServiceTask_4');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo',
          type: 'String',
          info: '"2"'
        }
      ]);
    }));


    it('should handle duplicate output definition (second overrides first)', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_8');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'foo',
          type: 'Number',
          info: '10'
        }
      ]);
    }));

  });


  describe('Propagation', function() {

    beforeEach(bootstrap(propagationXML));


    it('should input map <null> values', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_2');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingProcessVariable',
          type: 'Any',
          origin: [ 'SubProcess_2' ]
        }
      ]);
    }));


    it('should input map <null> values / nested', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_2');

      // when
      const variables = await variableResolver.getVariablesForElement(task);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingProcessVariable',
          type: 'Any',
          origin: [ 'SubProcess_2' ]
        }
      ]);
    }));


    it('should output map <null> values', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_3');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      // not a locally scoped sub-process variable, hence two origins
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingTaskVariable',
          type: 'Any',
          origin: [ 'SubProcess_3', 'Task_3' ]
        }
      ]);
    }));


    it('should output map <null> values / nested', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_3');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);


      // then
      // not a locally scoped sub-process variable, hence two origins
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingTaskVariable',
          type: 'Any',
          origin: [ 'SubProcess_3', 'Task_3' ]
        }
      ]);
    }));


    it('should roundtrip <null> values', inject(async function(variableResolver, elementRegistry) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      // when
      const variables = await variableResolver.getVariablesForElement(subProcess);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingProcessVariable',
          type: 'Any',
          origin: [ 'SubProcess_1' ]
        }
      ]);
    }));


    it('should roundtrip <null> values / nested', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const variables = await variableResolver.getVariablesForElement(task);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingProcessVariable',
          type: 'Any',
          origin: [ 'SubProcess_1' ]
        }
      ]);
    }));


    it('should roundtrip <null> values / back-to-back', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Participant_1');

      // when
      const variables = await variableResolver.getVariablesForElement(root.businessObject.processRef);

      // then
      expect(variables).to.variableEqual([
        {
          name: 'nonExistingProcessVariable',
          type: 'Any',
          origin: [ 'SubProcess_1' ]
        }
      ]);
    }));

  });


  describe('Script Task', function() {

    describe('valid', function() {

      beforeEach(bootstrap(scriptTaskXML));


      it('should add type annotation for script tasks', inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('ScriptTask');

        // when
        const variables = await variableResolver.getVariablesForElement(element.businessObject);

        // then
        expect(variables).to.variableEqual([
          {
            name: 'scriptResult',
            type: 'Context',
            info: '',
            entries: [
              { name: 'foo', type: 'Number', info: '123', entries: [] },
            ]
          }
        ]);
      }));
    });


    describe('empty expression', function() {

      beforeEach(bootstrap(scriptTaskEmptyExpressionXML));


      it('should NOT error for empty expression', inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('ScriptTask');

        // when
        const variables = await variableResolver.getVariablesForElement(element.businessObject);

        // then
        expect(variables).to.variableEqual([
          {
            name: 'scriptResult'
          }
        ]);
      }));
    });


    describe('output mapping without name', function() {

      beforeEach(bootstrap(scriptTaskOutputNoNameXML));


      it('should NOT error for output mapping without a name', inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('ScriptTask');

        // when
        const variables = await variableResolver.getVariablesForElement(element.businessObject);

        // then
        expect(variables).to.variableEqual([
          {
            name: 'scriptResult',
            type: 'Context',
            info: '',
            entries: [
              { name: 'foo', type: 'Number', info: '123', entries: [] },
            ]
          }
        ]);
      }));
    });
  });


  describe('Consumed Variables', function() {

    beforeEach(bootstrap(consumedVariablesXML));


    it('should extract input variables from simple expression', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('SimpleTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableEqual([
        { name: 'a', usedBy: [ 'SimpleTask' ] },
        { name: 'b', usedBy: [ 'SimpleTask' ] }
      ]);
    }));


    it('should extract input variables with nested properties', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('NestedTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude({
        name: 'order',
        entries: [ { name: 'items' } ],
        usedBy: [ 'NestedTask' ]
      });
    }));


    it('should deduplicate input variables across mappings', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('MultiInputTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then - y is used in both input mappings but should only appear once
      const yVars = variables.filter(v => v.name === 'y');
      expect(yVars).to.have.length(1);
    }));


    it('should extract all unique input variables from multiple mappings', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('MultiInputTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude([
        { name: 'x' },
        { name: 'y' },
        { name: 'z' }
      ]);
    }));


    it('should merge entries from multiple expressions referencing the same variable', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('MergedEntriesTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then - a.b and a.c should result in a: { entries: [b, c] }
      expect(variables).to.variableInclude({
        name: 'a',
        entries: [
          { name: 'b' },
          { name: 'c' }
        ]
      });
    }));


    it('should scope consumed variables to the origin task', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('SimpleTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then - a originates from SimpleTask (the task with the input mapping)
      const a = variables.find(v => v.name === 'a');
      expect(a).to.exist;
      expect(a.scope).to.not.exist;
    }));


    it('should keep provider and extracted variables separate', inject(async function(variableResolver, elementRegistry) {

      // given
      const root = elementRegistry.get('Process_1');
      const task = elementRegistry.get('SimpleTask');

      createProvider({
        variables: [ { name: 'a', type: 'Number', scope: root } ],
        variableResolver
      });

      // when - getVariables should have the scoped provider variable
      const variables = (await variableResolver.getVariables())['Process_1'];
      const scopedA = variables.find(v => v.name === 'a' && v.scope);
      expect(scopedA).to.exist;

      // and a read-only query should have the unscoped consumed variable
      const consumed = await getReadVariablesForElement(variableResolver, task);
      const unscopedA = consumed.find(v => v.name === 'a' && !v.scope);
      expect(unscopedA).to.exist;
    }));

  });


  describe('Consumed Variables - Input/Output Conflict', function() {

    beforeEach(bootstrap(inputOutputConflictXML));


    it('should extract consumed variable from input mapping when another task has output mapping with same name', inject(async function(variableResolver, elementRegistry) {

      // given
      const inputTask = elementRegistry.get('InputTask');
      const outputTask = elementRegistry.get('OutputTask');

      // when
      const inputReqs = await getReadVariablesForElement(variableResolver, inputTask);
      const outputReqs = await getReadVariablesForElement(variableResolver, outputTask);

      // then - foo is used in the input mapping of both tasks
      expect(inputReqs).to.variableInclude({ name: 'foo' });
      expect(outputReqs).to.variableInclude({ name: 'foo' });
    }));


    it('should return foo as read variable for InputTask', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('InputTask');

      // when
      const requirements = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(requirements).to.variableInclude({ name: 'foo' });
    }));


    it('should return foo as read variable for OutputTask', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('OutputTask');

      // when
      const requirements = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(requirements).to.variableInclude({ name: 'foo' });
    }));

  });


  describe('Consumed Variables - Script Tasks', function() {

    beforeEach(bootstrap(scriptTaskInputsXML));


    it('should extract input variables from script task expression', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('firstTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableEqual([
        { name: 'a', usedBy: [ 'firstTask' ] },
        { name: 'b', usedBy: [ 'firstTask' ] }
      ]);
    }));


    it('should extract input variables from second script task', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('secondTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableEqual([
        { name: 'd', usedBy: [ 'secondTask' ] },
        { name: 'f', usedBy: [ 'secondTask' ] }
      ]);
    }));


    it('should not include consumed variables in getVariablesForElement', inject(async function(variableResolver, elementRegistry) {

      // given
      const firstTask = elementRegistry.get('firstTask');

      // when
      const variables = await variableResolver.getVariablesForElement(firstTask);

      // then - consumed variables (a, b, d, f) should not appear since they have no scope
      const names = variables.map(v => v.name);
      expect(names).to.not.include('a');
      expect(names).to.not.include('b');
      expect(names).to.not.include('d');
      expect(names).to.not.include('f');
    }));

  });


  describe('Consumed Variables - Script Task with Input Mappings', function() {

    beforeEach(bootstrap(scriptTaskWithInputMappingsXML));


    it('should extract consumed variables from input mapping expressions but not from script for locally mapped variables', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('scriptWithInputs');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude([
        { name: 'processVar1' },
        { name: 'processVar2' }
      ]);

      const names = variables.map(v => v.name);
      expect(names).to.not.include('localA');
      expect(names).to.not.include('localB');
    }));


    it('should still extract consumed variables from script without input mappings', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('scriptWithoutInputs');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude([
        { name: 'x' },
        { name: 'y' }
      ]);
    }));


    it('should not require locally provided variable when chained input mapping references earlier target', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('chainedInputMappings');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude({ name: 'processVar3' });

      const names = variables.map(v => v.name);
      expect(names).to.not.include('localC');
      expect(names).to.not.include('localD');
    }));


    it('should keep shadowed variable as consumed variable when mapping a to a', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('shadowingTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude({ name: 'a' });
    }));


    it('should handle shadowing with chaining correctly', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('shadowingChainedTask');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableInclude({ name: 'a' });

      const names = variables.map(v => v.name);
      expect(names).to.not.include('b');
    }));


    it('should not require second input mapping variable used in script', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('scriptUsesSecondInput');

      // when
      const variables = await getReadVariablesForElement(variableResolver, task);

      // then
      expect(variables).to.variableEqual([
        { name: 'def' }
      ]);
    }));


    it('should annotate locally-provided input mapping variables with usedBy', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('scriptWithInputs');

      // when
      const variables = await variableResolver.getVariablesForElement(task);

      // then - localA and localB should have usedBy pointing to scriptResult
      expect(variables).to.variableInclude([
        { name: 'localA' },
        { name: 'localB' }
      ]);

      const localA = variables.find(v => v.name === 'localA');
      const localB = variables.find(v => v.name === 'localB');
      expect(localA.usedBy.map(usage => usage.id)).to.eql([ task.id ]);
      expect(localB.usedBy.map(usage => usage.id)).to.eql([ task.id ]);
    }));


    it('should annotate chained input mapping variables with usedBy', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('chainedInputMappings');

      // when
      const variables = await variableResolver.getVariablesForElement(task);

      // then - localC is used by both localD and chainedResult
      const localC = variables.find(v => v.name === 'localC');
      const localD = variables.find(v => v.name === 'localD');
      expect(localC).to.exist;
      expect(localC.usedBy.map(usage => usage.id)).to.eql([ task.id ]);
      expect(localD).to.exist;
      expect(localD.usedBy.map(usage => usage.id)).to.eql([ task.id ]);
    }));


    it('should not add usedBy for variables without input mappings', inject(async function(variableResolver, elementRegistry) {

      // given
      const task = elementRegistry.get('scriptWithoutInputs');

      // when
      const variables = await variableResolver.getVariablesForElement(task);

      // then - scriptResult2 should not have usedBy (it has no input mappings)
      const scriptResult2 = variables.find(v => v.name === 'scriptResult2');
      expect(scriptResult2).to.exist;
      expect(scriptResult2.usedBy).to.not.exist;
    }));

  });


  describe('#getVariablesForElement (read filter)', function() {

    describe('with input mappings', function() {

      beforeEach(bootstrap(consumedVariablesXML));


      it('should return consumed variables for a simple task', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then - both 'a' and 'b' are consumed variables for SimpleTask
        expect(requirements).to.variableEqual([
          { name: 'a' },
          { name: 'b' }
        ]);
      }));


      it('should return requirements with nested properties', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('NestedTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then
        expect(requirements).to.variableEqual([
          { name: 'order', entries: [ { name: 'items' } ] }
        ]);
      }));


      it('should return requirements from multiple input mappings', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('MultiInputTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then
        expect(requirements).to.variableInclude([
          { name: 'x' },
          { name: 'y' },
          { name: 'z' }
        ]);
      }));


      it('should return empty array for element without consumed variables', inject(async function(variableResolver, elementRegistry) {

        // given
        const process = elementRegistry.get('Process_1');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, process);

        // then
        expect(requirements).to.be.an('array').that.is.empty;
      }));


      it('should not return variables from other elements', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then - should not include variables from MultiInputTask or NestedTask
        expect(requirements).to.variableEqual([
          { name: 'a' },
          { name: 'b' }
        ]);
      }));


      it('should return consumed variables even when other tasks use the same variable', inject(async function(variableResolver, elementRegistry) {

        // given - MergedEntriesTask uses 'a' which is also used by SimpleTask
        // Consumed variables are per-task and should not be merged
        const task = elementRegistry.get('MergedEntriesTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then
        expect(requirements).to.variableEqual([
          { name: 'a', entries: [ { name: 'b' }, { name: 'c' } ] }
        ]);
      }));

    });


    describe('with script tasks', function() {

      beforeEach(bootstrap(scriptTaskInputsXML));


      it('should return consumed variables for script task', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('firstTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then
        expect(requirements).to.variableInclude([
          { name: 'a' },
          { name: 'b' }
        ]);
      }));


      it('should only return requirements for the requested task', inject(async function(variableResolver, elementRegistry) {

        // given
        const task = elementRegistry.get('secondTask');

        // when
        const requirements = await getReadVariablesForElement(variableResolver, task);

        // then
        expect(requirements).to.variableInclude([
          { name: 'd' },
          { name: 'f' }
        ]);

        const names = requirements.map(v => v.name);
        expect(names).to.not.include('a');
        expect(names).to.not.include('b');
      }));

    });


    describe('with script tasks and input mappings', function() {

      beforeEach(bootstrap(scriptTaskWithInputMappingsXML));


      it('should only return process variables as consumed variables, not locally mapped ones', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('scriptWithInputs')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'processVar1' },
          { name: 'processVar2' }
        ]);
      }));


      it('should return all script variables for task without input mappings', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('scriptWithoutInputs')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'x' },
          { name: 'y' }
        ]);
      }));


      it('should handle chained input mappings respecting order', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('chainedInputMappings')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'processVar3' }
        ]);
      }));


      it('should keep shadowed variable as requirement when mapping a to a', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('shadowingTask')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'a' }
        ]);
      }));


      it('should handle shadowing with chained mappings', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('shadowingChainedTask')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'a' }
        ]);
      }));


      it('should allow script to use all input targets regardless of order', inject(async function(variableResolver, elementRegistry) {

        // when
        const requirements = await getReadVariablesForElement(variableResolver,
          elementRegistry.get('scriptUsesSecondInput')
        );

        // then
        expect(requirements).to.variableEqual([
          { name: 'def' }
        ]);
      }));

    });


    describe('error handling', function() {

      beforeEach(bootstrap(emptyXML));


      it('should reject when getVariables fails', inject(async function(variableResolver, elementRegistry) {

        // given
        const process = elementRegistry.get('Process_1');
        sinon.stub(variableResolver, 'getVariables').rejects(new Error('test error'));

        // when
        // then
        let error;

        try {
          await getReadVariablesForElement(variableResolver, process);
        } catch (err) {
          error = err;
        }

        expect(error).to.exist;
        expect(error.message).to.eql('test error');

        variableResolver.getVariables.restore();
      }));

    });

  });

});

// helpers //////////////////////

const createProvider = function({ variables, variableResolver, origin }) {
  return new class TestProvider extends VariableProvider {
    getVariables(element) {
      if (origin) {
        return origin === element.id ? variables : [];
      }

      if (is(element, 'bpmn:Process')) {
        return variables;
      }
    }
  }(variableResolver);
};

async function getReadVariablesForElement(variableResolver, element) {
  const variables = await variableResolver.getVariablesForElement(element, {
    read: true,
    written: false
  });

  // Preserve old consumed-only test semantics: consumed variables are unscoped.
  return variables.filter(variable => !variable.scope);
}

function toVariableFormat(variables) {
  return Object.keys(variables).map(v => {
    return {
      name: v,
      info: v + 'Info',
      type: v + 'Type',
      entries: toVariableFormat(variables[v])
    };
  });
}
