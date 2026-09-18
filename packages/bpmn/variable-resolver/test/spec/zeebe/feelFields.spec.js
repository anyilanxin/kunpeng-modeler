import { expect } from 'chai';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import { bootstrapModeler, inject } from 'test/TestHelper';

import { KunpengVariableResolverModule } from 'lib/';

import multiInstanceXML from 'test/fixtures/zeebe/used-variables.feel-fields.multi-instance.bpmn';
import eventsXML from 'test/fixtures/zeebe/used-variables.feel-fields.events.bpmn';
import messageXML from 'test/fixtures/zeebe/used-variables.feel-fields.message.bpmn';
import zeebeExtensionsXML from 'test/fixtures/zeebe/used-variables.feel-fields.zeebe-extensions.bpmn';
import adHocXML from 'test/fixtures/zeebe/used-variables.feel-fields.ad-hoc.bpmn';
import inputFilterXML from 'test/fixtures/zeebe/used-variables.feel-fields.input-filter.bpmn';

const MODULE_OPTIONS = {
  additionalModules: [ KunpengVariableResolverModule ],
  moddleExtensions: { zeebe: ZeebeModdle }
};

describe('FEEL fields - consumed variables', function() {

  describe('multi-instance loop characteristics', function() {

    beforeEach(bootstrapModeler(multiInstanceXML, MODULE_OPTIONS));

    it('should collect all three loop characteristics expressions',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_mi');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'miInputCollection', usedBy: [ 'Task_mi' ] },
          { name: 'miOutputElement', usedBy: [ 'Task_mi' ] },
          { name: 'miCompletionCondition', usedBy: [ 'Task_mi' ] }
        ]);
      })
    );


    it('should expose all loop characteristics expressions globally',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        // then
        expect(vars['Process_1']).to.variableEqual([
          { name: 'miInputCollection', scope: undefined, origin: undefined, usedBy: [ 'Task_mi' ] },
          { name: 'miOutputElement', scope: undefined, origin: undefined, usedBy: [ 'Task_mi' ] },
          { name: 'miCompletionCondition', scope: undefined, origin: undefined, usedBy: [ 'Task_mi' ] }
        ]);
      })
    );

  });


  describe('BPMN event expressions', function() {

    beforeEach(bootstrapModeler(eventsXML, MODULE_OPTIONS));

    it('should collect conditional boundary event condition',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_cond');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'condVar', usedBy: [ 'Event_cond' ] }
        ]);
      })
    );


    it('should collect timer event timeDuration',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_timer');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'timerVar', usedBy: [ 'Event_timer' ] }
        ]);
      })
    );


    it('should collect signal event signal name',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_signal');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'signalNameVar', usedBy: [ 'Event_signal' ] }
        ]);
      })
    );


    it('should collect error boundary event errorCode',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_error');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'errorCodeVar', usedBy: [ 'Event_error' ] }
        ]);
      })
    );


    it('should collect escalation boundary event escalationCode',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_escalation');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'escalCodeVar', usedBy: [ 'Event_escalation' ] }
        ]);
      })
    );


    it('should expose all event expressions globally',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        // then
        expect(vars['Process_1']).to.variableEqual([
          { name: 'condVar', scope: undefined, origin: undefined, usedBy: [ 'Event_cond' ] },
          { name: 'timerVar', scope: undefined, origin: undefined, usedBy: [ 'Event_timer' ] },
          { name: 'signalNameVar', scope: undefined, origin: undefined, usedBy: [ 'Event_signal' ] },
          { name: 'errorCodeVar', scope: undefined, origin: undefined, usedBy: [ 'Event_error' ] },
          { name: 'escalCodeVar', scope: undefined, origin: undefined, usedBy: [ 'Event_escalation' ] }
        ]);
      })
    );

  });


  describe('message expressions', function() {

    beforeEach(bootstrapModeler(messageXML, MODULE_OPTIONS));

    it('should collect FEEL message name from message start event',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('StartEvent_msg');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'msgStartNameVar', usedBy: [ 'StartEvent_msg' ] }
        ]);
      })
    );


    it('should collect FEEL correlation key from message catch event',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Event_msg_catch');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'corrKeyVar', usedBy: [ 'Event_msg_catch' ] }
        ]);
      })
    );


    it('should collect FEEL correlation key from receive task',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_receive');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'receiveTaskCorrKey', usedBy: [ 'Task_receive' ] }
        ]);
      })
    );


    it('should not add a consumed variable for static (non-FEEL) message name',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();
        const names = (vars['Process_1'] || []).map(v => v.name);

        // then
        expect(names).not.to.include('StaticName');
        expect(names).not.to.include('ReceiveMessage');
      })
    );


    it('should expose all message expressions globally',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        // then
        expect(vars['Process_1']).to.variableEqual([
          { name: 'msgStartNameVar', scope: undefined, origin: undefined, usedBy: [ 'StartEvent_msg' ] },
          { name: 'corrKeyVar', scope: undefined, origin: undefined, usedBy: [ 'Event_msg_catch' ] },
          { name: 'receiveTaskCorrKey', scope: undefined, origin: undefined, usedBy: [ 'Task_receive' ] }
        ]);
      })
    );

  });


  describe('Zeebe extension element expressions', function() {

    beforeEach(bootstrapModeler(zeebeExtensionsXML, MODULE_OPTIONS));

    it('should collect AssignmentDefinition assignee, candidateGroups, candidateUsers',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_assign');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'assigneeVar', usedBy: [ 'Task_assign' ] },
          { name: 'candidateGroupsVar', usedBy: [ 'Task_assign' ] },
          { name: 'candidateUsersVar', usedBy: [ 'Task_assign' ] }
        ]);
      })
    );


    it('should collect TaskDefinition type and retries',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_taskdef');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'jobTypeVar', usedBy: [ 'Task_taskdef' ] },
          { name: 'retriesVar', usedBy: [ 'Task_taskdef' ] }
        ]);
      })
    );


    it('should collect TaskSchedule dueDate and followUpDate',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_schedule');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'dueDateVar', usedBy: [ 'Task_schedule' ] },
          { name: 'followUpDateVar', usedBy: [ 'Task_schedule' ] }
        ]);
      })
    );


    it('should collect PriorityDefinition priority',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_priority');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'priorityVar', usedBy: [ 'Task_priority' ] }
        ]);
      })
    );


    it('should collect CalledElement processId (Call Activity)',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_call');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'processIdVar', usedBy: [ 'Task_call' ] }
        ]);
      })
    );


    it('should collect CalledDecision decisionId (Business Rule Task)',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('Task_decision');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'decisionIdVar', usedBy: [ 'Task_decision' ] }
        ]);
      })
    );


    it('should expose all extension element expressions globally',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        // then
        expect(vars['Process_1']).to.variableEqual([
          { name: 'assigneeVar', scope: undefined, origin: undefined, usedBy: [ 'Task_assign' ] },
          { name: 'candidateGroupsVar', scope: undefined, origin: undefined, usedBy: [ 'Task_assign' ] },
          { name: 'candidateUsersVar', scope: undefined, origin: undefined, usedBy: [ 'Task_assign' ] },
          { name: 'jobTypeVar', scope: undefined, origin: undefined, usedBy: [ 'Task_taskdef' ] },
          { name: 'retriesVar', scope: undefined, origin: undefined, usedBy: [ 'Task_taskdef' ] },
          { name: 'dueDateVar', scope: undefined, origin: undefined, usedBy: [ 'Task_schedule' ] },
          { name: 'followUpDateVar', scope: undefined, origin: undefined, usedBy: [ 'Task_schedule' ] },
          { name: 'priorityVar', scope: undefined, origin: undefined, usedBy: [ 'Task_priority' ] },
          { name: 'processIdVar', scope: undefined, origin: undefined, usedBy: [ 'Task_call' ] },
          { name: 'decisionIdVar', scope: undefined, origin: undefined, usedBy: [ 'Task_decision' ] }
        ]);
      })
    );

  });


  describe('ad-hoc sub-process expressions', function() {

    beforeEach(bootstrapModeler(adHocXML, MODULE_OPTIONS));

    it('should collect zeebe:AdHoc and completionCondition expressions',
      inject(async function(variableResolver, elementRegistry) {

        // given
        const element = elementRegistry.get('AdHoc_1');

        // when
        const vars = await variableResolver.getVariablesForElement(element);

        // then
        expect(vars).to.variableEqual([
          { name: 'activeElemsVar', usedBy: [ 'AdHoc_1' ] },
          { name: 'outputElemVar', usedBy: [ 'AdHoc_1' ] },
          { name: 'adHocDoneVar', usedBy: [ 'AdHoc_1' ] }
        ]);
      })
    );


    it('should expose all ad-hoc expressions globally',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        // then
        expect(vars['Process_1']).to.variableEqual([
          { name: 'activeElemsVar', scope: undefined, origin: undefined, usedBy: [ 'AdHoc_1' ] },
          { name: 'outputElemVar', scope: undefined, origin: undefined, usedBy: [ 'AdHoc_1' ] },
          { name: 'adHocDoneVar', scope: undefined, origin: undefined, usedBy: [ 'AdHoc_1' ] }
        ]);
      })
    );

  });


  describe('input mapping filter', function() {

    beforeEach(bootstrapModeler(inputFilterXML, MODULE_OPTIONS));

    it('should not report a variable as consumed if provided by input mapping',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();

        const consumed = (vars['Process_1'] || []).filter(v => !v.scope);
        const names = consumed.map(v => v.name);

        // then
        expect(names).not.to.include('inputMapped');
      })
    );


    it('should report a variable as consumed if not provided by input mapping',
      inject(async function(variableResolver) {

        // when
        const vars = await variableResolver.getVariables();
        const consumed = (vars['Process_1'] || []).filter(v => !v.scope);

        // then
        const notMappedVar = consumed.find(v => v.name === 'notMappedVar');
        expect(notMappedVar, 'notMappedVar consumed variable').to.exist;
        expect(notMappedVar.usedBy.some(e => e.id === 'Task_no_filter')).to.be.true;
      })
    );

  });

});
